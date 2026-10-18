package service

import (
	"testing"
)

func TestExamValidTransitions(t *testing.T) {
	tests := []struct {
		from     string
		to       string
		expected bool
	}{
		// Valid transitions
		{ExamStatusScheduled, ExamStatusInProgress, true},
		{ExamStatusScheduled, ExamStatusCancelled, true},
		{ExamStatusInProgress, ExamStatusScoring, true},
		{ExamStatusInProgress, ExamStatusCancelled, true},
		{ExamStatusScoring, ExamStatusCompleted, true},
		{ExamStatusScoring, ExamStatusInProgress, true},

		// Invalid transitions
		{ExamStatusScheduled, ExamStatusCompleted, false},
		{ExamStatusCompleted, ExamStatusScheduled, false},
		{ExamStatusCancelled, ExamStatusInProgress, false},
	}

	for _, tc := range tests {
		actual := isValidExamTransition(tc.from, tc.to)
		if actual != tc.expected {
			t.Errorf("isValidExamTransition(%q, %q) = %v; want %v", tc.from, tc.to, actual, tc.expected)
		}
	}
}

func TestCommitteeRules(t *testing.T) {
	// Rule: Committee max 3 members, exactly 1 Chairman
	type Member struct {
		TeacherID string
		Role      string
	}

	validateCommittee := func(members []Member, advisorID string) (bool, string) {
		if len(members) > 3 {
			return false, "committee cannot exceed 3 members"
		}
		chairCount := 0
		for _, m := range members {
			if m.TeacherID == advisorID {
				return false, "thesis advisor cannot be an examination committee member"
			}
			if m.Role == "CHAIRMAN" {
				chairCount++
			}
		}
		if chairCount > 1 {
			return false, "cannot have more than 1 chairman"
		}
		return true, ""
	}

	// Case 1: Valid committee
	validMembers := []Member{
		{TeacherID: "t-1", Role: "CHAIRMAN"},
		{TeacherID: "t-2", Role: "COMMITTEE"},
		{TeacherID: "t-3", Role: "COMMITTEE"},
	}
	if ok, reason := validateCommittee(validMembers, "t-adv"); !ok {
		t.Errorf("expected valid committee, got: %s", reason)
	}

	// Case 2: Advisor in committee (Conflict of Interest)
	conflictMembers := []Member{
		{TeacherID: "t-adv", Role: "CHAIRMAN"},
		{TeacherID: "t-2", Role: "COMMITTEE"},
	}
	if ok, _ := validateCommittee(conflictMembers, "t-adv"); ok {
		t.Errorf("expected rejection when advisor is in committee")
	}

	// Case 3: More than 1 Chairman
	twoChairs := []Member{
		{TeacherID: "t-1", Role: "CHAIRMAN"},
		{TeacherID: "t-2", Role: "CHAIRMAN"},
	}
	if ok, _ := validateCommittee(twoChairs, "t-adv"); ok {
		t.Errorf("expected rejection when more than 1 chairman")
	}

	// Case 4: More than 3 members
	fourMembers := []Member{
		{TeacherID: "t-1", Role: "CHAIRMAN"},
		{TeacherID: "t-2", Role: "COMMITTEE"},
		{TeacherID: "t-3", Role: "COMMITTEE"},
		{TeacherID: "t-4", Role: "COMMITTEE"},
	}
	if ok, _ := validateCommittee(fourMembers, "t-adv"); ok {
		t.Errorf("expected rejection when committee exceeds 3 members")
	}
}

func TestPassThresholdRule(t *testing.T) {
	if PassThreshold != 60.0 {
		t.Errorf("expected PassThreshold to be 60.0, got %f", PassThreshold)
	}
}
