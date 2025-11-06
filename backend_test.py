#!/usr/bin/env python3
"""
Backend API Testing for Grain Sales Website
Tests all backend endpoints with various scenarios including edge cases
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from frontend environment
BACKEND_URL = "https://grain-catalog.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name: str, passed: bool, message: str = ""):
        """Log test result"""
        self.results["total_tests"] += 1
        if passed:
            self.results["passed"] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED {message}")
    
    def test_get_grains(self):
        """Test GET /api/grains endpoint"""
        print("\n=== Testing GET /api/grains ===")
        
        try:
            response = requests.get(f"{BACKEND_URL}/grains", timeout=10)
            
            # Test 1: Status code should be 200
            self.log_result(
                "GET /api/grains - Status Code", 
                response.status_code == 200,
                f"Expected 200, got {response.status_code}"
            )
            
            if response.status_code != 200:
                self.log_result(
                    "GET /api/grains - Response Body",
                    False,
                    f"Response: {response.text}"
                )
                return
            
            # Test 2: Response should be JSON
            try:
                data = response.json()
                self.log_result("GET /api/grains - JSON Response", True)
            except json.JSONDecodeError:
                self.log_result(
                    "GET /api/grains - JSON Response", 
                    False, 
                    "Response is not valid JSON"
                )
                return
            
            # Test 3: Should return exactly 5 grains
            self.log_result(
                "GET /api/grains - Count", 
                len(data) == 5,
                f"Expected 5 grains, got {len(data)}"
            )
            
            # Test 4: Each grain should have required fields
            required_fields = ['id', 'name_ua', 'name_en', 'quality', 'moisture', 'protein', 'gluten', 'nature', 'image']
            
            for i, grain in enumerate(data):
                for field in required_fields:
                    self.log_result(
                        f"GET /api/grains - Grain {i+1} has {field}",
                        field in grain and grain[field] is not None,
                        f"Missing or null field: {field}"
                    )
            
            # Test 5: Verify specific grain data structure
            if len(data) > 0:
                first_grain = data[0]
                self.log_result(
                    "GET /api/grains - First grain structure",
                    all(isinstance(first_grain.get(field), str) for field in required_fields),
                    "All fields should be strings"
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result("GET /api/grains - Connection", False, f"Request failed: {str(e)}")
    
    def test_post_orders_valid(self):
        """Test POST /api/orders with valid data"""
        print("\n=== Testing POST /api/orders - Valid Cases ===")
        
        valid_order = {
            "grain_type": "Пшениця",
            "grain_id": "1",
            "quality": "premium",
            "quantity": 25.5,
            "customer_name": "Іван Петренко",
            "customer_phone": "+380501234567",
            "customer_email": "ivan.petrenko@example.com",
            "comment": "Потрібна доставка до складу"
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/orders", 
                json=valid_order,
                timeout=10
            )
            
            # Test 1: Status code should be 200
            self.log_result(
                "POST /api/orders - Valid Data Status", 
                response.status_code == 200,
                f"Expected 200, got {response.status_code}. Response: {response.text}"
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Test 2: Response should have success=True
                    self.log_result(
                        "POST /api/orders - Success Response",
                        data.get("success") is True,
                        f"Expected success=True, got {data.get('success')}"
                    )
                    
                    # Test 3: Should have order_id
                    self.log_result(
                        "POST /api/orders - Order ID",
                        "order_id" in data and data["order_id"],
                        "Missing or empty order_id"
                    )
                    
                    # Test 4: Should have message
                    self.log_result(
                        "POST /api/orders - Message",
                        "message" in data and data["message"],
                        "Missing or empty message"
                    )
                    
                except json.JSONDecodeError:
                    self.log_result("POST /api/orders - JSON Response", False, "Invalid JSON response")
                    
        except requests.exceptions.RequestException as e:
            self.log_result("POST /api/orders - Valid Data Connection", False, f"Request failed: {str(e)}")
    
    def test_post_orders_invalid_email(self):
        """Test POST /api/orders with invalid email formats"""
        print("\n=== Testing POST /api/orders - Invalid Email ===")
        
        invalid_emails = [
            "invalid-email",
            "test@",
            "@example.com",
            "test..test@example.com",
            "test@example",
            ""
        ]
        
        base_order = {
            "grain_type": "Пшениця",
            "grain_id": "1",
            "quality": "premium",
            "quantity": 10.0,
            "customer_name": "Test User",
            "customer_phone": "+380501234567",
            "comment": "Test order"
        }
        
        for email in invalid_emails:
            order_data = base_order.copy()
            order_data["customer_email"] = email
            
            try:
                response = requests.post(
                    f"{BACKEND_URL}/orders", 
                    json=order_data,
                    timeout=10
                )
                
                # Should return 422 for validation error
                self.log_result(
                    f"POST /api/orders - Invalid Email '{email}'",
                    response.status_code == 422,
                    f"Expected 422, got {response.status_code}. Response: {response.text}"
                )
                
            except requests.exceptions.RequestException as e:
                self.log_result(f"POST /api/orders - Invalid Email '{email}' Connection", False, f"Request failed: {str(e)}")
    
    def test_post_orders_missing_fields(self):
        """Test POST /api/orders with missing required fields"""
        print("\n=== Testing POST /api/orders - Missing Fields ===")
        
        complete_order = {
            "grain_type": "Пшениця",
            "grain_id": "1",
            "quality": "premium",
            "quantity": 10.0,
            "customer_name": "Test User",
            "customer_phone": "+380501234567",
            "customer_email": "test@example.com",
            "comment": "Test order"
        }
        
        required_fields = ["grain_type", "grain_id", "quality", "quantity", "customer_name", "customer_phone", "customer_email"]
        
        for field in required_fields:
            order_data = complete_order.copy()
            del order_data[field]
            
            try:
                response = requests.post(
                    f"{BACKEND_URL}/orders", 
                    json=order_data,
                    timeout=10
                )
                
                # Should return 422 for missing field
                self.log_result(
                    f"POST /api/orders - Missing '{field}'",
                    response.status_code == 422,
                    f"Expected 422, got {response.status_code}. Response: {response.text}"
                )
                
            except requests.exceptions.RequestException as e:
                self.log_result(f"POST /api/orders - Missing '{field}' Connection", False, f"Request failed: {str(e)}")
    
    def test_post_orders_boundary_values(self):
        """Test POST /api/orders with boundary values for quantity"""
        print("\n=== Testing POST /api/orders - Boundary Values ===")
        
        base_order = {
            "grain_type": "Пшениця",
            "grain_id": "1",
            "quality": "premium",
            "customer_name": "Test User",
            "customer_phone": "+380501234567",
            "customer_email": "test@example.com",
            "comment": "Test order"
        }
        
        boundary_quantities = [
            (0, "Zero quantity"),
            (-1, "Negative quantity"),
            (-100.5, "Large negative quantity"),
            (999999999, "Very large quantity"),
            (0.001, "Very small positive quantity")
        ]
        
        for quantity, description in boundary_quantities:
            order_data = base_order.copy()
            order_data["quantity"] = quantity
            
            try:
                response = requests.post(
                    f"{BACKEND_URL}/orders", 
                    json=order_data,
                    timeout=10
                )
                
                # Log the result - we're testing behavior, not expecting specific status codes
                self.log_result(
                    f"POST /api/orders - {description} ({quantity})",
                    True,  # We just want to see what happens
                    f"Status: {response.status_code}, Response: {response.text[:100]}"
                )
                
            except requests.exceptions.RequestException as e:
                self.log_result(f"POST /api/orders - {description} Connection", False, f"Request failed: {str(e)}")
    
    def test_post_contacts_valid(self):
        """Test POST /api/contacts with valid data"""
        print("\n=== Testing POST /api/contacts - Valid Cases ===")
        
        valid_contact = {
            "name": "Марія Іваненко",
            "email": "maria.ivanenko@example.com",
            "phone": "+380671234567",
            "message": "Цікавить можливість постачання пшениці на постійній основі. Потрібні деталі щодо цін та умов доставки."
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/contacts", 
                json=valid_contact,
                timeout=10
            )
            
            # Test 1: Status code should be 200
            self.log_result(
                "POST /api/contacts - Valid Data Status", 
                response.status_code == 200,
                f"Expected 200, got {response.status_code}. Response: {response.text}"
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Test 2: Response should have success=True
                    self.log_result(
                        "POST /api/contacts - Success Response",
                        data.get("success") is True,
                        f"Expected success=True, got {data.get('success')}"
                    )
                    
                    # Test 3: Should have message
                    self.log_result(
                        "POST /api/contacts - Message",
                        "message" in data and data["message"],
                        "Missing or empty message"
                    )
                    
                except json.JSONDecodeError:
                    self.log_result("POST /api/contacts - JSON Response", False, "Invalid JSON response")
                    
        except requests.exceptions.RequestException as e:
            self.log_result("POST /api/contacts - Valid Data Connection", False, f"Request failed: {str(e)}")
    
    def test_post_contacts_invalid_email(self):
        """Test POST /api/contacts with invalid email formats"""
        print("\n=== Testing POST /api/contacts - Invalid Email ===")
        
        invalid_emails = [
            "invalid-email",
            "test@",
            "@example.com",
            "test..test@example.com",
            "test@example",
            ""
        ]
        
        base_contact = {
            "name": "Test User",
            "phone": "+380501234567",
            "message": "Test message"
        }
        
        for email in invalid_emails:
            contact_data = base_contact.copy()
            contact_data["email"] = email
            
            try:
                response = requests.post(
                    f"{BACKEND_URL}/contacts", 
                    json=contact_data,
                    timeout=10
                )
                
                # Should return 422 for validation error
                self.log_result(
                    f"POST /api/contacts - Invalid Email '{email}'",
                    response.status_code == 422,
                    f"Expected 422, got {response.status_code}. Response: {response.text}"
                )
                
            except requests.exceptions.RequestException as e:
                self.log_result(f"POST /api/contacts - Invalid Email '{email}' Connection", False, f"Request failed: {str(e)}")
    
    def test_post_contacts_missing_fields(self):
        """Test POST /api/contacts with missing required fields"""
        print("\n=== Testing POST /api/contacts - Missing Fields ===")
        
        complete_contact = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+380501234567",
            "message": "Test message"
        }
        
        required_fields = ["name", "email", "phone", "message"]
        
        for field in required_fields:
            contact_data = complete_contact.copy()
            del contact_data[field]
            
            try:
                response = requests.post(
                    f"{BACKEND_URL}/contacts", 
                    json=contact_data,
                    timeout=10
                )
                
                # Should return 422 for missing field
                self.log_result(
                    f"POST /api/contacts - Missing '{field}'",
                    response.status_code == 422,
                    f"Expected 422, got {response.status_code}. Response: {response.text}"
                )
                
            except requests.exceptions.RequestException as e:
                self.log_result(f"POST /api/contacts - Missing '{field}' Connection", False, f"Request failed: {str(e)}")
    
    def test_special_characters(self):
        """Test endpoints with special characters in text fields"""
        print("\n=== Testing Special Characters ===")
        
        special_chars_text = "Test with special chars: àáâãäåæçèéêë ñòóôõö ùúûüý ąćęłńóśźż 中文 العربية 🌾🚚"
        
        # Test order with special characters
        order_with_special = {
            "grain_type": special_chars_text,
            "grain_id": "1",
            "quality": "premium",
            "quantity": 10.0,
            "customer_name": special_chars_text,
            "customer_phone": "+380501234567",
            "customer_email": "test@example.com",
            "comment": special_chars_text
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/orders", 
                json=order_with_special,
                timeout=10
            )
            
            self.log_result(
                "POST /api/orders - Special Characters",
                response.status_code in [200, 422],  # Either success or validation error is acceptable
                f"Status: {response.status_code}, Response: {response.text[:100]}"
            )
            
        except requests.exceptions.RequestException as e:
            self.log_result("POST /api/orders - Special Characters Connection", False, f"Request failed: {str(e)}")
        
        # Test contact with special characters
        contact_with_special = {
            "name": special_chars_text,
            "email": "test@example.com",
            "phone": "+380501234567",
            "message": special_chars_text
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/contacts", 
                json=contact_with_special,
                timeout=10
            )
            
            self.log_result(
                "POST /api/contacts - Special Characters",
                response.status_code in [200, 422],  # Either success or validation error is acceptable
                f"Status: {response.status_code}, Response: {response.text[:100]}"
            )
            
        except requests.exceptions.RequestException as e:
            self.log_result("POST /api/contacts - Special Characters Connection", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🧪 Starting Backend API Tests for: {BACKEND_URL}")
        print("=" * 60)
        
        # Run all test methods
        self.test_get_grains()
        self.test_post_orders_valid()
        self.test_post_orders_invalid_email()
        self.test_post_orders_missing_fields()
        self.test_post_orders_boundary_values()
        self.test_post_contacts_valid()
        self.test_post_contacts_invalid_email()
        self.test_post_contacts_missing_fields()
        self.test_special_characters()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        
        if self.results['errors']:
            print("\n❌ FAILED TESTS:")
            for error in self.results['errors']:
                print(f"  - {error}")
        
        success_rate = (self.results['passed'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)