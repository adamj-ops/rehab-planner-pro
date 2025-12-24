import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      purchasePrice,
      rehabCost,
      arv, // After Repair Value
      holdingCosts = 0,
      closingCosts = 0,
      sellingCosts = 0,
      investmentStrategy = 'flip'
    } = body

    if (!purchasePrice || !rehabCost || !arv) {
      return NextResponse.json(
        { error: 'Missing required fields: purchasePrice, rehabCost, arv' },
        { status: 400 }
      )
    }

    // Calculate total investment
    const totalInvestment = purchasePrice + rehabCost + holdingCosts + closingCosts

    // Calculate selling costs (typically 6-10% of ARV for commissions + closing)
    const calculatedSellingCosts = sellingCosts || (arv * 0.08)

    // Net profit
    const netProfit = arv - totalInvestment - calculatedSellingCosts

    // ROI percentage
    const roiPercentage = (netProfit / totalInvestment) * 100

    // Additional metrics for flips
    const flipMetrics = investmentStrategy === 'flip' ? {
      seventyPercentRule: arv * 0.7,
      maxAllowableOffer: (arv * 0.7) - rehabCost,
      profitMargin: (netProfit / arv) * 100,
      returnOnCost: (netProfit / totalInvestment) * 100,
    } : null

    // Additional metrics for rentals
    const rentalMetrics = investmentStrategy === 'rental' ? {
      // These would be calculated based on additional inputs
      monthlyRent: 0,
      capRate: 0,
      cashOnCashReturn: 0,
      grossYield: 0,
    } : null

    const roiAnalysis = {
      totalInvestment,
      arv,
      netProfit,
      roiPercentage,
      sellingCosts: calculatedSellingCosts,
      breakdown: {
        purchasePrice,
        rehabCost,
        holdingCosts,
        closingCosts,
        totalCosts: totalInvestment,
        estimatedSalePrice: arv,
        sellingCosts: calculatedSellingCosts,
        netProfit,
      },
      flipMetrics,
      rentalMetrics,
      recommendations: []
    }

    // Add recommendations based on ROI
    if (roiPercentage < 15 && investmentStrategy === 'flip') {
      roiAnalysis.recommendations.push({
        type: 'warning',
        message: 'ROI below 15% may not justify the risk for a flip',
        suggestion: 'Consider reducing purchase price or rehab scope'
      })
    }

    if (flipMetrics && purchasePrice > flipMetrics.maxAllowableOffer) {
      roiAnalysis.recommendations.push({
        type: 'warning',
        message: 'Purchase price exceeds maximum allowable offer (70% rule)',
        suggestion: `Consider negotiating down to $${flipMetrics.maxAllowableOffer.toLocaleString()}`
      })
    }

    return NextResponse.json({
      success: true,
      data: roiAnalysis
    })
  } catch (error) {
    console.error('Error calculating ROI:', error)
    return NextResponse.json(
      { error: 'Failed to calculate ROI' },
      { status: 500 }
    )
  }
}

