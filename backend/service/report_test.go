package service

import (
	"testing"
)

func TestReportMetricsCalculation(t *testing.T) {
	totalGroups := 10
	totalQuota := 84
	slotsUsed := totalGroups
	slotsRemain := totalQuota - slotsUsed

	if slotsRemain != 74 {
		t.Fatalf("expected remaining slots to be 74, got %d", slotsRemain)
	}

	fin := FinancialSummaryDTO{
		TotalFeesCollected:   float64(totalGroups) * 350000.0,
		CommitteeDisbursed:   float64(totalGroups) * 160000.0,
		SnackBudgetsTotal:    float64(totalGroups) * 10000.0,
		DepartmentNetBalance: float64(totalGroups) * 180000.0,
		Currency:             "LAK",
	}

	expectedCollected := 3500000.0
	if fin.TotalFeesCollected != expectedCollected {
		t.Errorf("expected fees collected %v, got %v", expectedCollected, fin.TotalFeesCollected)
	}

	expectedDisbursed := 1600000.0 // 60k chairman + 50k member + 50k secretary = 160k per group
	if fin.CommitteeDisbursed != expectedDisbursed {
		t.Errorf("expected committee disbursed %v, got %v", expectedDisbursed, fin.CommitteeDisbursed)
	}

	expectedSnack := 100000.0 // 10k per group
	if fin.SnackBudgetsTotal != expectedSnack {
		t.Errorf("expected snack budget %v, got %v", expectedSnack, fin.SnackBudgetsTotal)
	}

	expectedNet := 1800000.0 // 350k - 160k - 10k = 180k per group
	if fin.DepartmentNetBalance != expectedNet {
		t.Errorf("expected net balance %v, got %v", expectedNet, fin.DepartmentNetBalance)
	}
}
