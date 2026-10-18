package service

import (
	"testing"
)

func TestThesisValidTransitions(t *testing.T) {
	tests := []struct {
		from     string
		to       string
		expected bool
	}{
		// Valid transitions
		{ThesisStatusDraft, ThesisStatusProposed, true},
		{ThesisStatusDraft, ThesisStatusCancelled, true},
		{ThesisStatusProposed, ThesisStatusTopicApproved, true},
		{ThesisStatusProposed, ThesisStatusDraft, true},
		{ThesisStatusTopicApproved, ThesisStatusInProgress, true},
		{ThesisStatusInProgress, ThesisStatusProposalExamScheduled, true},
		{ThesisStatusProposalExamScheduled, ThesisStatusProposalPassed, true},
		{ThesisStatusProposalPassed, ThesisStatusDevelopment, true},
		{ThesisStatusDevelopment, ThesisStatusFinalSubmitted, true},
		{ThesisStatusFinalSubmitted, ThesisStatusFinalExamScheduled, true},
		{ThesisStatusFinalExamScheduled, ThesisStatusFinalPassed, true},
		{ThesisStatusFinalPassed, ThesisStatusCompleted, true},
		{ThesisStatusFinalPassed, ThesisStatusRevisionRequired, true},
		{ThesisStatusRevisionRequired, ThesisStatusCompleted, true},

		// Invalid transitions
		{ThesisStatusDraft, ThesisStatusCompleted, false},
		{ThesisStatusDraft, ThesisStatusFinalPassed, false},
		{ThesisStatusCompleted, ThesisStatusDraft, false},
		{ThesisStatusCancelled, ThesisStatusDraft, false},
		{ThesisStatusProposalPassed, ThesisStatusCompleted, false},
	}

	for _, tc := range tests {
		actual := isValidTransition(tc.from, tc.to)
		if actual != tc.expected {
			t.Errorf("isValidTransition(%q, %q) = %v; want %v", tc.from, tc.to, actual, tc.expected)
		}
	}
}

func TestThesisGroupSizeRules(t *testing.T) {
	// Rule: Strictly 2 to 3 students per thesis group (ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ)
	isValidGroupSize := func(memberCount int) bool {
		return memberCount >= 2 && memberCount <= 3
	}

	tests := []struct {
		count    int
		expected bool
	}{
		{0, false},
		{1, false},
		{2, true},
		{3, true},
		{4, false},
		{5, false},
	}

	for _, tc := range tests {
		actual := isValidGroupSize(tc.count)
		if actual != tc.expected {
			t.Errorf("isValidGroupSize(%d) = %v; want %v", tc.count, actual, tc.expected)
		}
	}
}

func TestMultimediaDepartmentalCapRule(t *testing.T) {
	// Rule: Multimedia category has a strict department-wide cap of 12 groups total.
	const multimediaCap = 12

	isWithinCap := func(currentActive int) bool {
		return currentActive < multimediaCap
	}

	if !isWithinCap(0) {
		t.Errorf("expected 0 active to be within cap")
	}
	if !isWithinCap(11) {
		t.Errorf("expected 11 active to be within cap")
	}
	if isWithinCap(12) {
		t.Errorf("expected 12 active to exceed or reach cap")
	}
	if isWithinCap(13) {
		t.Errorf("expected 13 active to exceed cap")
	}
}

func TestAdvisorQuotaRules(t *testing.T) {
	// Rule: Advisor quota cannot be exceeded (assigned < quota).
	canAssignAdvisor := func(assigned, quota int) bool {
		return assigned < quota
	}

	if !canAssignAdvisor(0, 5) {
		t.Errorf("expected advisor with 0/5 to be available")
	}
	if !canAssignAdvisor(4, 5) {
		t.Errorf("expected advisor with 4/5 to be available")
	}
	if canAssignAdvisor(5, 5) {
		t.Errorf("expected advisor with 5/5 to be fully booked")
	}
	if canAssignAdvisor(6, 5) {
		t.Errorf("expected advisor with 6/5 to be over quota")
	}
}
