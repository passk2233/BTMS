package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/btms/backend/utils"
)

type BindingStyle string

const (
	BindingHardcover BindingStyle = "ປົກແຂງ (ປ້ຳຄຳ)"
	BindingSoftcover BindingStyle = "ປົກອ່ອນ (ກາວຮ້ອນ)"
	BindingSpiral    BindingStyle = "ເຂົ້າສັນກະດູກງູ"
)

type PrintOrderStage string

const (
	PrintStageQueued    PrintOrderStage = "QUEUED"
	PrintStagePrinting  PrintOrderStage = "PRINTING"
	PrintStageBinding   PrintOrderStage = "BINDING"
	PrintStageReady     PrintOrderStage = "READY"
	PrintStageDelivered PrintOrderStage = "DELIVERED"
)

type PrintOrderDTO struct {
	ID           string  `json:"id"`
	OrderNo      string  `json:"order_no"`
	ThesisCode   string  `json:"thesis_code"`
	ThesisTitle  string  `json:"thesis_title"`
	StudentName  string  `json:"student_name"`
	Copies       int     `json:"copies"`
	TotalPages   int     `json:"total_pages"`
	ColorPages   int     `json:"color_pages"`
	BindingStyle string  `json:"binding_style"`
	TotalCost    float64 `json:"total_cost"`
	Stage        string  `json:"stage"`
	StageLabel   string  `json:"stage_label"`
	OrderedAt    string  `json:"ordered_at"`
}

type CalculateCostRequest struct {
	Copies       int    `json:"copies"`
	TotalPages   int    `json:"total_pages"`
	ColorPages   int    `json:"color_pages"`
	BindingStyle string `json:"binding_style"`
}

type CalculateCostResponse struct {
	Copies         int     `json:"copies"`
	BWPagesPerCopy int     `json:"bw_pages_per_copy"`
	BWPageCost     float64 `json:"bw_page_cost"`
	ColorPageCost  float64 `json:"color_page_cost"`
	BindingCost    float64 `json:"binding_cost"`
	CostPerCopy    float64 `json:"cost_per_copy"`
	TotalCost      float64 `json:"total_cost"`
	Currency       string  `json:"currency"`
}

type PrintingService struct {
	mu     sync.RWMutex
	orders []PrintOrderDTO
}

func NewPrintingService() *PrintingService {
	// Initialize with standard demo orders
	return &PrintingService{
		orders: []PrintOrderDTO{
			{
				ID:           "PO-101",
				OrderNo:      "PR-2026-001",
				ThesisCode:   "CS-2026-001",
				ThesisTitle:  "ລະບົບກວດຈັບຮອຍຮົ່ວທໍ່ສົ່ງອາຍແກັສດ້ວຍໂດຣນອັດຕະໂນມັດ",
				StudentName:  "ອາລຸນ ເຊັນ (65010042)",
				Copies:       5,
				TotalPages:   120,
				ColorPages:   25,
				BindingStyle: string(BindingHardcover),
				TotalCost:    925000,
				Stage:        string(PrintStageBinding),
				StageLabel:   "ກຳລັງເຂົ້າຮູບເຫຼັ້ມ",
				OrderedAt:    "2026-10-02 11:20",
			},
			{
				ID:           "PO-102",
				OrderNo:      "PR-2026-002",
				ThesisCode:   "CS-2026-002",
				ThesisTitle:  "ການຈຳແນກອາລົມຈາກສັນຍານຄື້ນສະໝອງ EEG",
				StudentName:  "ນິລັນ ເດຊາ (65010190)",
				Copies:       3,
				TotalPages:   95,
				ColorPages:   15,
				BindingStyle: string(BindingHardcover),
				TotalCost:    547500,
				Stage:        string(PrintStagePrinting),
				StageLabel:   "ກຳລັງພິມ",
				OrderedAt:    "2026-10-03 08:45",
			},
			{
				ID:           "PO-103",
				OrderNo:      "PR-2026-003",
				ThesisCode:   "CS-2025-089",
				ThesisTitle:  "ລະບົບບັນຊີແຈກຢາຍແບບກະຈາຍສູນ",
				StudentName:  "ທະນັດ ລ. (64010502)",
				Copies:       5,
				TotalPages:   140,
				ColorPages:   30,
				BindingStyle: string(BindingHardcover),
				TotalCost:    1050000,
				Stage:        string(PrintStageReady),
				StageLabel:   "ພ້ອມຮັບເຫຼັ້ມແລ້ວ",
				OrderedAt:    "2026-09-28 14:00",
			},
		},
	}
}

// CalculateCost implements official university printing rate calculations:
// - Black & White: 500 LAK per page
// - Color: 3,000 LAK per page
// - Binding: Hardcover 50,000 LAK; Softcover 25,000 LAK; Spiral 15,000 LAK per copy
func (s *PrintingService) CalculateCost(copies, totalPages, colorPages int, bindingStyle string) (*CalculateCostResponse, error) {
	if copies <= 0 {
		return nil, utils.BadRequest("Number of copies must be at least 1.")
	}
	if totalPages <= 0 {
		return nil, utils.BadRequest("Total pages must be greater than 0.")
	}
	if colorPages < 0 || colorPages > totalPages {
		return nil, utils.BadRequest("Color pages cannot be negative or exceed total pages.")
	}

	bwPages := totalPages - colorPages
	const (
		bwPageRate    = 500.0   // LAK
		colorPageRate = 3000.0  // LAK
		hardcoverRate = 50000.0 // LAK
		softcoverRate = 25000.0 // LAK
		spiralRate    = 15000.0 // LAK
	)

	bindingRate := hardcoverRate
	switch bindingStyle {
	case string(BindingSoftcover), "SOFTCOVER", "softcover":
		bindingRate = softcoverRate
	case string(BindingSpiral), "SPIRAL", "spiral":
		bindingRate = spiralRate
	default:
		bindingRate = hardcoverRate
	}

	bwCostPerCopy := float64(bwPages) * bwPageRate
	colorCostPerCopy := float64(colorPages) * colorPageRate
	costPerCopy := bwCostPerCopy + colorCostPerCopy + bindingRate
	totalCost := costPerCopy * float64(copies)

	return &CalculateCostResponse{
		Copies:         copies,
		BWPagesPerCopy: bwPages,
		BWPageCost:     bwCostPerCopy,
		ColorPageCost:  colorCostPerCopy,
		BindingCost:    bindingRate,
		CostPerCopy:    costPerCopy,
		TotalCost:      totalCost,
		Currency:       "LAK",
	}, nil
}

func (s *PrintingService) ListOrders(ctx context.Context) ([]PrintOrderDTO, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	res := make([]PrintOrderDTO, len(s.orders))
	copy(res, s.orders)
	return res, nil
}

func (s *PrintingService) GetOrder(ctx context.Context, id string) (*PrintOrderDTO, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, o := range s.orders {
		if o.ID == id || o.OrderNo == id {
			return &o, nil
		}
	}
	return nil, utils.NotFound(fmt.Sprintf("Print order %q not found.", id))
}

type CreatePrintOrderInput struct {
	ThesisCode   string `json:"thesis_code" binding:"required"`
	ThesisTitle  string `json:"thesis_title" binding:"required"`
	StudentName  string `json:"student_name" binding:"required"`
	Copies       int    `json:"copies" binding:"required"`
	TotalPages   int    `json:"total_pages" binding:"required"`
	ColorPages   int    `json:"color_pages"`
	BindingStyle string `json:"binding_style"`
}

func (s *PrintingService) CreateOrder(ctx context.Context, input CreatePrintOrderInput) (*PrintOrderDTO, error) {
	calc, err := s.CalculateCost(input.Copies, input.TotalPages, input.ColorPages, input.BindingStyle)
	if err != nil {
		return nil, err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	newID := fmt.Sprintf("PO-%d", len(s.orders)+101)
	newOrderNo := fmt.Sprintf("PR-2026-%03d", len(s.orders)+1)
	style := input.BindingStyle
	if style == "" {
		style = string(BindingHardcover)
	}

	order := PrintOrderDTO{
		ID:           newID,
		OrderNo:      newOrderNo,
		ThesisCode:   input.ThesisCode,
		ThesisTitle:  input.ThesisTitle,
		StudentName:  input.StudentName,
		Copies:       input.Copies,
		TotalPages:   input.TotalPages,
		ColorPages:   input.ColorPages,
		BindingStyle: style,
		TotalCost:    calc.TotalCost,
		Stage:        string(PrintStageQueued),
		StageLabel:   "ລໍຖ້າດຳເນີນການ",
		OrderedAt:    time.Now().Format("2006-01-02 15:04"),
	}

	s.orders = append([]PrintOrderDTO{order}, s.orders...)
	return &order, nil
}

func (s *PrintingService) UpdateStage(ctx context.Context, id string, newStage string) (*PrintOrderDTO, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	stageLabel := "ລໍຖ້າດຳເນີນການ"
	switch newStage {
	case string(PrintStageQueued):
		stageLabel = "ລໍຖ້າດຳເນີນການ"
	case string(PrintStagePrinting):
		stageLabel = "ກຳລັງພິມ"
	case string(PrintStageBinding):
		stageLabel = "ກຳລັງເຂົ້າຮູບເຫຼັ້ມ"
	case string(PrintStageReady):
		stageLabel = "ພ້ອມຮັບເຫຼັ້ມແລ້ວ"
	case string(PrintStageDelivered):
		stageLabel = "ມອບສົ່ງສຳເລັດ"
	default:
		return nil, utils.BadRequest(fmt.Sprintf("Invalid print stage %q.", newStage))
	}

	for i := range s.orders {
		if s.orders[i].ID == id || s.orders[i].OrderNo == id {
			s.orders[i].Stage = newStage
			s.orders[i].StageLabel = stageLabel
			res := s.orders[i]
			return &res, nil
		}
	}
	return nil, utils.NotFound(fmt.Sprintf("Print order %q not found.", id))
}
