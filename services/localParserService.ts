
export const parseIncomeLocal = (text: string) => {
  // 匹配数字，支持正负号和小数
  const amountMatch = text.match(/(-?\d+(\.\d+)?)/);
  if (!amountMatch) return null;

  let amount = parseFloat(amountMatch[0]);
  
  // 识别负向词汇
  const negativeWords = ['亏', '支', '花', '费', '损', '掉', '买'];
  const isNegative = negativeWords.some(word => text.includes(word));
  
  // 识别正向词汇
  const positiveWords = ['赚', '入', '收', '薪', '奖', '利', '回'];
  const isPositive = positiveWords.some(word => text.includes(word));

  if (isNegative && amount > 0) amount = -amount;
  if (isPositive && amount < 0) amount = Math.abs(amount);

  // 提取来源：去掉数字后的剩余文本
  let source = text.replace(amountMatch[0], '').replace(/[赚入收薪奖利回亏支花费损掉买了元￥$]/g, '').trim();
  if (!source) source = amount > 0 ? "额外收益" : "必要支出";

  // 简单分类
  let category = "其他";
  if (text.includes("工资") || text.includes("薪")) category = "工作";
  else if (text.includes("基金") || text.includes("股票") || text.includes("理财")) category = "理财";
  else if (text.includes("外快") || text.includes("副业")) category = "副业";
  else if (isNegative) category = "亏损支出";

  return {
    amount,
    source,
    category
  };
};

export const calculateEstimatedDays = (target: number, current: number, records: any[]) => {
  const remaining = target - current;
  if (remaining <= 0) return 0;

  // 计算过去30天的平均每日收益
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentRecords = records.filter(r => r.timestamp > thirtyDaysAgo);
  
  const totalIncome = recentRecords.reduce((sum, r) => sum + r.amount, 0);
  const dailyAverage = totalIncome / 30;

  if (dailyAverage <= 0) return null; // 无法预估（收益不足或亏损中）
  
  return Math.ceil(remaining / dailyAverage);
};
