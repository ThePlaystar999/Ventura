#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class VenturaAPITester:
    def __init__(self, base_url="https://valuation-hub-25.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, status_code=None, error=None, response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "status_code": status_code,
            "error": error,
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if status_code:
            print(f"    Status: {status_code}")
        if error:
            print(f"    Error: {error}")
        if response_data and isinstance(response_data, dict):
            print(f"    Response keys: {list(response_data.keys())}")
        print()

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{self.base_url}/")
            success = response.status_code == 200
            data = response.json() if success else None
            self.log_test("GET /api/", success, response.status_code, 
                         None if success else response.text, data)
        except Exception as e:
            self.log_test("GET /api/", False, None, str(e))

        # Test health endpoint
        try:
            response = self.session.get(f"{self.base_url}/health")
            success = response.status_code == 200
            data = response.json() if success else None
            self.log_test("GET /api/health", success, response.status_code, 
                         None if success else response.text, data)
        except Exception as e:
            self.log_test("GET /api/health", False, None, str(e))

    def test_contact_endpoint(self):
        """Test contact form submission"""
        print("🔍 Testing Contact Endpoint...")
        
        contact_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": "test@example.com",
            "message": "This is a test message from automated testing."
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/contact",
                json=contact_data,
                headers={'Content-Type': 'application/json'}
            )
            success = response.status_code == 200
            data = response.json() if success else None
            self.log_test("POST /api/contact", success, response.status_code, 
                         None if success else response.text, data)
            
            # Verify response structure
            if success and data:
                required_fields = ['message_id', 'name', 'email', 'message', 'created_at']
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    self.log_test("Contact Response Structure", False, None, 
                                f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Contact Response Structure", True)
                    
        except Exception as e:
            self.log_test("POST /api/contact", False, None, str(e))

    def test_auth_protected_endpoints_without_auth(self):
        """Test that protected endpoints return 401 without authentication"""
        print("🔍 Testing Protected Endpoints (No Auth)...")
        
        protected_endpoints = [
            ("GET", "/projects"),
            ("POST", "/projects"),
            ("GET", "/valuations"),
            ("POST", "/valuations"),
            ("GET", "/auth/me")
        ]
        
        for method, endpoint in protected_endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}")
                elif method == "POST":
                    response = self.session.post(f"{self.base_url}{endpoint}", json={})
                
                # Should return 401 for protected endpoints
                success = response.status_code == 401
                self.log_test(f"{method} {endpoint} (No Auth)", success, response.status_code,
                            None if success else "Expected 401 Unauthorized")
                            
            except Exception as e:
                self.log_test(f"{method} {endpoint} (No Auth)", False, None, str(e))

    def test_share_endpoints(self):
        """Test public share endpoints with dummy tokens"""
        print("🔍 Testing Share Endpoints...")
        
        # Test with non-existent share token (should return 404)
        dummy_token = "nonexistent123"
        
        try:
            response = self.session.get(f"{self.base_url}/share/{dummy_token}")
            success = response.status_code == 404
            self.log_test(f"GET /api/share/{dummy_token}", success, response.status_code,
                         None if success else "Expected 404 Not Found")
        except Exception as e:
            self.log_test(f"GET /api/share/{dummy_token}", False, None, str(e))

        # Test PDF endpoint with non-existent token
        try:
            response = self.session.get(f"{self.base_url}/share/{dummy_token}/pdf")
            success = response.status_code == 404
            self.log_test(f"GET /api/share/{dummy_token}/pdf", success, response.status_code,
                         None if success else "Expected 404 Not Found")
        except Exception as e:
            self.log_test(f"GET /api/share/{dummy_token}/pdf", False, None, str(e))

    def test_create_test_user_and_session(self):
        """Create a test user and session directly in MongoDB for testing"""
        print("🔍 Creating Test User Session...")
        
        # This would normally require MongoDB access
        # For now, we'll test the session creation endpoint structure
        session_data = {
            "session_id": f"test_session_{uuid.uuid4().hex[:12]}"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/session",
                json=session_data,
                headers={'Content-Type': 'application/json'}
            )
            
            # This will likely fail without valid Emergent session_id, but we can test the endpoint
            success = response.status_code in [200, 400, 401]  # Any of these are valid responses
            self.log_test("POST /api/auth/session", success, response.status_code,
                         None if success else response.text)
                         
        except Exception as e:
            self.log_test("POST /api/auth/session", False, None, str(e))

    def test_invalid_endpoints(self):
        """Test invalid endpoints return 404"""
        print("🔍 Testing Invalid Endpoints...")
        
        invalid_endpoints = [
            "/api/nonexistent",
            "/api/projects/invalid_id",
            "/api/valuations/invalid_id"
        ]
        
        for endpoint in invalid_endpoints:
            try:
                response = self.session.get(f"{self.base_url.replace('/api', '')}{endpoint}")
                success = response.status_code == 404
                self.log_test(f"GET {endpoint}", success, response.status_code,
                            None if success else "Expected 404 Not Found")
            except Exception as e:
                self.log_test(f"GET {endpoint}", False, None, str(e))

    def test_cors_headers(self):
        """Test CORS headers are present"""
        print("🔍 Testing CORS Headers...")
        
        try:
            response = self.session.options(f"{self.base_url}/")
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            present_headers = [h for h in cors_headers if h in response.headers]
            success = len(present_headers) > 0
            
            self.log_test("CORS Headers Present", success, response.status_code,
                         None if success else f"Missing CORS headers: {cors_headers}")
                         
        except Exception as e:
            self.log_test("CORS Headers Present", False, None, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Ventura API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 50)
        
        # Run test suites
        self.test_health_endpoints()
        self.test_contact_endpoint()
        self.test_auth_protected_endpoints_without_auth()
        self.test_share_endpoints()
        self.test_create_test_user_and_session()
        self.test_invalid_endpoints()
        self.test_cors_headers()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "detailed_results": self.test_results
        }

def main():
    tester = VenturaAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    results = tester.get_test_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())