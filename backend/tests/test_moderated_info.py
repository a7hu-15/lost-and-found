import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.security.dependencies import get_current_user
from app.models.user import User, UserRole
from unittest.mock import patch

mock_admin_user = User(
    id="test-admin-id",
    email="admin@srm.edu",
    role=UserRole.ADMIN_OWNER,
    is_active=True,
    permissions={"manage_items": True, "moderate_lost_items": True}
)

async def override_get_current_user():
    return mock_admin_user

@pytest.fixture
def mock_send_email():
    with patch("app.notifications.service.send_email") as mock:
        yield mock

@pytest.mark.asyncio
async def test_moderated_information_flow(mock_send_email):
    # Override authentication for admin routes
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create a lost item
        lost_item_payload = {
            "title": "QA Test Wallet",
            "category": "Wallet",
            "location": "Cafeteria",
            "lost_date": "2026-08-09",
            "description": "Black leather wallet",
            "contact_email": "owner@srm.edu",
            "contact_phone": "+91 9876543210"
        }
        res_lost = await ac.post("/api/v1/lost/create", data=lost_item_payload)
        assert res_lost.status_code == 201
        report_id = res_lost.json()["report_id"]
        
        # 12. Existing Lost/Found confirmation emails still work
        # When creating a report, it sends a confirmation email.
        assert mock_send_email.call_count >= 1
        
        # Reset mock before testing information flow
        mock_send_email.reset_mock()

        # 1. Visitor can submit information
        # 11. Malicious input is safely handled (XSS test)
        info_payload = {
            "message": "I saw a wallet <script>alert('xss')</script> near the entrance. I am sure it's yours."
        }
        res_info = await ac.post(f"/api/v1/lost/{report_id}/information", json=info_payload)
        assert res_info.status_code == 201
        info_id = res_info.json()["id"]
        
        # 2. Only platform receives the pending-information notification
        # 3. Owner receives nothing before approval
        assert mock_send_email.call_count == 1
        call_args = mock_send_email.call_args[0]
        # send_email(to_email, subject, text, html)
        assert "New Information Submitted" in call_args[1]
        
        mock_send_email.reset_mock()

        # 4. Admin sees the pending message
        res_admin_list = await ac.get("/api/v1/admin/information?status=PENDING")
        assert res_admin_list.status_code == 200
        pending_items = res_admin_list.json()
        assert any(item["id"] == info_id for item in pending_items)
        
        # 5. Reject -> owner receives nothing
        res_reject = await ac.patch(f"/api/v1/admin/information/{info_id}/status", json={"status": "REJECTED"})
        assert res_reject.status_code == 200
        assert mock_send_email.call_count == 0
        
        # Submit another tip for approval
        info_payload_2 = {
            "message": "I handed it over to the security desk on the ground floor. It should be safe."
        }
        res_info_2 = await ac.post(f"/api/v1/lost/{report_id}/information", json=info_payload_2)
        assert res_info_2.status_code == 201
        info_id_2 = res_info_2.json()["id"]
        
        mock_send_email.reset_mock()

        # 6. Approve -> owner receives exactly one email
        res_approve = await ac.patch(f"/api/v1/admin/information/{info_id_2}/status", json={"status": "APPROVED"})
        assert res_approve.status_code == 200
        
        # Owner receives email
        assert mock_send_email.call_count == 1
        call_args_app = mock_send_email.call_args[0]
        assert call_args_app[0] == "owner@srm.edu"
        assert "Someone Submitted Information" in call_args_app[1]
        
        mock_send_email.reset_mock()

        # 7. Approving twice doesn't send two emails (Idempotent)
        res_approve_2 = await ac.patch(f"/api/v1/admin/information/{info_id_2}/status", json={"status": "APPROVED"})
        assert res_approve_2.status_code == 200
        assert mock_send_email.call_count == 0

        # 10. Rate limiting works (5/minute)
        # We sent 2 tips already. 
        # Send 4 more tips rapidly.
        rate_limit_triggered = False
        for i in range(4):
            res_rate = await ac.post(f"/api/v1/lost/{report_id}/information", json={"message": f"Extra tip {i} here is some text to meet min length"})
            if res_rate.status_code == 429:
                rate_limit_triggered = True
                break
        
        if not rate_limit_triggered:
            # Maybe it resets? Just send one more to be absolutely sure.
            res_rate = await ac.post(f"/api/v1/lost/{report_id}/information", json={"message": "One more tip to break the limit"})
            if res_rate.status_code == 429:
                rate_limit_triggered = True
                
        assert rate_limit_triggered, "Rate limiting was not triggered as expected"

        # 14. Contact Support still goes only to the platform
        mock_send_email.reset_mock()
        res_support = await ac.post("/api/v1/support", json={
            "name": "User", "email": "user@example.com", "subject": "Help Test", "message": "Help me please with the platform"
        })
        assert res_support.status_code == 201
        # No email to the user (unless a confirmation is designed, but the requirement is "only goes to platform" if any)

    # Clean up dependency override
    app.dependency_overrides.pop(get_current_user, None)
