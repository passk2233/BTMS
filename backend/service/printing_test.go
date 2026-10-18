package service

import (
	"testing"
)

func TestPrintingCostCalculation(t *testing.T) {
	svc := NewPrintingService()

	// Test 1: Standard Hardcover Order (120 pages: 25 color, 95 BW, 5 copies)
	// BW: 95 * 500 = 47,500 LAK
	// Color: 25 * 3,000 = 75,000 LAK
	// Hardcover: 50,000 LAK
	// Cost per copy = 47,500 + 75,000 + 50,000 = 172,500 LAK
	// Total for 5 copies = 862,500 LAK
	res, err := svc.CalculateCost(5, 120, 25, string(BindingHardcover))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.CostPerCopy != 172500 {
		t.Errorf("expected cost per copy 172,500, got %f", res.CostPerCopy)
	}
	if res.TotalCost != 862500 {
		t.Errorf("expected total cost 862,500, got %f", res.TotalCost)
	}

	// Test 2: Softcover Order
	res2, err := svc.CalculateCost(2, 50, 0, string(BindingSoftcover))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// 50 BW pages * 500 = 25,000 LAK + 25,000 Softcover = 50,000 LAK per copy
	if res2.CostPerCopy != 50000 {
		t.Errorf("expected softcover cost per copy 50,000, got %f", res2.CostPerCopy)
	}
	if res2.TotalCost != 100000 {
		t.Errorf("expected total cost 100,000 for 2 copies, got %f", res2.TotalCost)
	}

	// Test 3: Invalid inputs (0 copies)
	_, err = svc.CalculateCost(0, 100, 10, string(BindingHardcover))
	if err == nil {
		t.Errorf("expected error for 0 copies")
	}

	// Test 4: Invalid inputs (color pages > total pages)
	_, err = svc.CalculateCost(1, 10, 20, string(BindingHardcover))
	if err == nil {
		t.Errorf("expected error when color pages exceed total pages")
	}
}
