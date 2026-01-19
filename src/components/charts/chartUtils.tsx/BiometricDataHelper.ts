import { BodyComposition } from "@/src/types";

export function processBodyComposition(data: BodyComposition[]) {
  if (!data || data.length === 0) return { weight: [], bodyFatNavy: [], bodyFatCalipers: [], bodyFatComposite: [] }
  
  const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const weightData: Array<{ x: Date; y: number }> = sorted.map(item => ({
    x: new Date(item.date),
    y: Number(item.weight.toFixed(1))
  }))
  
  const bodyFatNavyData: Array<{ x: Date; y: number }> = []
  const bodyFatCalipersData: Array<{ x: Date; y: number }> = []
  const bodyFatCompositeData: Array<{ x: Date; y: number }> = []
  
  const blocks: BodyComposition[][] = []
  let currentBlock: BodyComposition[] = []
  let currentBlockStart = sorted[0]?.week || 0
  
  sorted.forEach(item => {
    if (item.week - currentBlockStart >= 4 && currentBlock.length > 0) {
      blocks.push(currentBlock)
      currentBlock = [item]
      currentBlockStart = item.week
    } else {
      currentBlock.push(item)
    }
  })
  if (currentBlock.length > 0) blocks.push(currentBlock)
    
  blocks.forEach(block => {
    const validNavy = block.filter(item => typeof item.bodyFatNavy === 'number' && !isNaN(item.bodyFatNavy))
    const validCalipers = block.filter(item => typeof item.bodyFatCalipers === 'number' && !isNaN(item.bodyFatCalipers))
    
    if (validNavy.length === 0 && validCalipers.length === 0) return
    
    const avgNavy = validNavy.length > 0 
      ? validNavy.reduce((sum, item) => sum + item.bodyFatNavy, 0) / validNavy.length 
      : NaN
    const avgCalipers = validCalipers.length > 0 
      ? validCalipers.reduce((sum, item) => sum + item.bodyFatCalipers, 0) / validCalipers.length 
      : NaN
    
    const midIndex = Math.floor(block.length / 2)
    const date = new Date(block[midIndex].date)
    
    if (!isNaN(avgNavy)) {
      bodyFatNavyData.push({ x: date, y: Number(avgNavy.toFixed(1)) })
    }
    if (!isNaN(avgCalipers)) {
      bodyFatCalipersData.push({ x: date, y: Number(avgCalipers.toFixed(1)) })
    }
    if (!isNaN(avgNavy) && !isNaN(avgCalipers)) {
      const avgComposite = (avgNavy + avgCalipers) / 2
      bodyFatCompositeData.push({ x: date, y: Number(avgComposite.toFixed(1)) })
    }
  })
  
  return { weight: weightData, bodyFatNavy: bodyFatNavyData, bodyFatCalipers: bodyFatCalipersData, bodyFatComposite: bodyFatCompositeData }
}