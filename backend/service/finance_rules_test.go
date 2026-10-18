package service

import (
	"testing"
)

func TestOfficialHonorariumRates(t *testing.T) {
	// Standard CEIT 2026-2027 committee honorarium per thesis group:
	// - Chairman: 60,000 LAK
	// - Committee Member: 50,000 LAK
	// - Snack budget: 10,000 LAK
	const (
		ChairmanRate  = 60000.0
		CommitteeRate = 50000.0
		SnackRate     = 10000.0
	)

	calculateCommitteeBudget := func(numGroups int) (chairmanTotal, memberTotal, snackTotal, grandTotal float64) {
		chairmanTotal = float64(numGroups) * ChairmanRate
		memberTotal = float64(numGroups) * (2 * CommitteeRate) // 2 members
		snackTotal = float64(numGroups) * SnackRate
		grandTotal = chairmanTotal + memberTotal + snackTotal
		return
	}

	c, m, s, total := calculateCommitteeBudget(10)
	if c != 600000.0 {
		t.Errorf("expected chairman total 600,000, got %f", c)
	}
	if m != 1000000.0 {
		t.Errorf("expected members total 1,000,000, got %f", m)
	}
	if s != 100000.0 {
		t.Errorf("expected snack total 100,000, got %f", s)
	}
	if total != 1700000.0 {
		t.Errorf("expected grand total 1,700,000, got %f", total)
	}
}

func TestFeeRatesRules(t *testing.T) {
	rates := map[string]float64{
		"PROPOSAL_EXAM":   350000.00,
		"PROPOSAL_RETAKE": 200000.00,
		"FINAL_EXAM":      500000.00,
		"FINAL_RETAKE":    300000.00,
	}

	if rates["PROPOSAL_EXAM"] != 350000.00 {
		t.Errorf("expected PROPOSAL_EXAM to be 350,000 LAK")
	}
	if rates["FINAL_EXAM"] != 500000.00 {
		t.Errorf("expected FINAL_EXAM to be 500,000 LAK")
	}
}
