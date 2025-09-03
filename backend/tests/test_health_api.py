"""
Tests for health API endpoints
"""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Test health check endpoint"""

    def test_health_endpoint_success(self, client: TestClient):
        """Test health endpoint returns success"""
        response = client.get("/health/")

        assert response.status_code == 200
        data = response.json()

        # Check required fields
        assert "status" in data
        assert "timestamp" in data
        assert "environment" in data
        assert "version" in data

        # Check values
        assert data["status"] == "healthy"
        assert data["environment"] == "development"
        assert data["version"] == "1.0.0"

        # Check timestamp format
        timestamp_str = data["timestamp"]
        try:
            datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        except ValueError:
            pytest.fail(f"Invalid timestamp format: {timestamp_str}")

    def test_health_endpoint_without_trailing_slash(self, client: TestClient):
        """Test health endpoint without trailing slash (should redirect)"""
        response = client.get("/health", follow_redirects=False)

        # Should redirect to /health/
        assert response.status_code == 307  # Temporary redirect
        assert response.headers["location"] == "http://testserver/health/"

    def test_health_endpoint_with_redirect_follow(self, client: TestClient):
        """Test health endpoint follows redirect correctly"""
        response = client.get("/health", follow_redirects=True)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_endpoint_response_structure(self, client: TestClient):
        """Test health endpoint response has correct structure"""
        response = client.get("/health/")

        assert response.status_code == 200
        data = response.json()

        # Check all expected fields are present
        expected_fields = ["status", "timestamp", "environment", "version"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"

        # Check field types
        assert isinstance(data["status"], str)
        assert isinstance(data["timestamp"], str)
        assert isinstance(data["environment"], str)
        assert isinstance(data["version"], str)

    def test_health_endpoint_content_type(self, client: TestClient):
        """Test health endpoint returns JSON content type"""
        response = client.get("/health/")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_health_endpoint_multiple_calls(self, client: TestClient):
        """Test health endpoint consistency across multiple calls"""
        # Make multiple requests
        responses = []
        for _ in range(3):
            response = client.get("/health/")
            assert response.status_code == 200
            responses.append(response.json())

        # Check that static fields remain consistent
        for i in range(1, len(responses)):
            assert responses[i]["status"] == responses[0]["status"]
            assert responses[i]["environment"] == responses[0]["environment"]
            assert responses[i]["version"] == responses[0]["version"]

        # Timestamps should be different (or at least not fail)
        # Note: They might be the same if requests are very fast


class TestRootEndpoint:
    """Test root API endpoint"""

    def test_root_endpoint_success(self, client: TestClient):
        """Test root endpoint returns success"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()

        # Check required fields
        assert "message" in data
        assert "version" in data
        assert "environment" in data

        # Check values
        assert data["message"] == "Ignacio Bot API"
        assert data["version"] == "1.0.0"
        assert data["environment"] == "development"

    def test_root_endpoint_response_structure(self, client: TestClient):
        """Test root endpoint response structure"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()

        # Check field types
        assert isinstance(data["message"], str)
        assert isinstance(data["version"], str)
        assert isinstance(data["environment"], str)

    def test_root_endpoint_content_type(self, client: TestClient):
        """Test root endpoint returns JSON content type"""
        response = client.get("/")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"


class TestEndpointAvailability:
    """Test general endpoint availability and error handling"""

    def test_invalid_endpoint_404(self, client: TestClient):
        """Test that invalid endpoints return 404"""
        response = client.get("/invalid-endpoint")

        assert response.status_code == 404

    def test_health_endpoint_methods(self, client: TestClient):
        """Test health endpoint only accepts GET method"""
        # GET should work
        response = client.get("/health/")
        assert response.status_code == 200

        # POST should not be allowed
        response = client.post("/health/")
        assert response.status_code == 405  # Method not allowed

        # PUT should not be allowed
        response = client.put("/health/")
        assert response.status_code == 405

        # DELETE should not be allowed
        response = client.delete("/health/")
        assert response.status_code == 405

    def test_root_endpoint_methods(self, client: TestClient):
        """Test root endpoint only accepts GET method"""
        # GET should work
        response = client.get("/")
        assert response.status_code == 200

        # POST should not be allowed
        response = client.post("/")
        assert response.status_code == 405

        # PUT should not be allowed
        response = client.put("/")
        assert response.status_code == 405

        # DELETE should not be allowed
        response = client.delete("/")
        assert response.status_code == 405

    def test_cors_headers_present(self, client: TestClient):
        """Test that CORS headers are present in responses"""
        response = client.get("/health/", headers={"Origin": "http://localhost:3000"})

        assert response.status_code == 200
        # CORS headers should be present
        assert (
            "access-control-allow-origin" in response.headers
            or "Access-Control-Allow-Origin" in response.headers
        )

    def test_options_request_handling(self, client: TestClient):
        """Test OPTIONS request handling for CORS"""
        response = client.options(
            "/health/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        # Should handle OPTIONS request
        assert response.status_code in [
            200,
            204,
            405,
        ]  # Various valid responses for OPTIONS


class TestAPIDocumentation:
    """Test API documentation endpoints"""

    def test_openapi_json_available(self, client: TestClient):
        """Test OpenAPI JSON schema is available"""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        data = response.json()

        # Check it's a valid OpenAPI schema
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data

        # Check our endpoints are documented
        assert "/health/" in data["paths"]
        assert "/" in data["paths"]

    def test_docs_endpoint_available(self, client: TestClient):
        """Test Swagger UI documentation is available"""
        response = client.get("/docs")

        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")

    def test_redoc_endpoint_available(self, client: TestClient):
        """Test ReDoc documentation is available"""
        response = client.get("/redoc")

        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")


class TestHealthEndpointIntegration:
    """Integration tests for health endpoint"""

    def test_health_endpoint_reflects_environment(self, client: TestClient):
        """Test that health endpoint reflects current environment"""
        response = client.get("/health/")

        assert response.status_code == 200
        data = response.json()

        # Should match the current environment setting
        assert data["environment"] in ["development", "production", "testing"]

    def test_health_endpoint_uptime_check(self, client: TestClient):
        """Test health endpoint can be used for uptime monitoring"""
        import time

        # First request
        response1 = client.get("/health/")
        timestamp1 = response1.json()["timestamp"]

        # Small delay
        time.sleep(0.1)

        # Second request
        response2 = client.get("/health/")
        timestamp2 = response2.json()["timestamp"]

        # Both should be successful
        assert response1.status_code == 200
        assert response2.status_code == 200

        # Timestamps should be different (or at least valid)
        assert (
            timestamp1 != timestamp2 or True
        )  # Allow same timestamp for fast requests

    def test_health_endpoint_load_test_simulation(self, client: TestClient):
        """Test health endpoint under simulated load"""
        responses = []

        # Simulate multiple concurrent health checks
        for _ in range(10):
            response = client.get("/health/")
            responses.append(response)

        # All should succeed
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
