const ExpenseRecord = require('../models/ExpenseRecord');
const IncomeRecord = require('../models/IncomeRecord');

// 智能建议规则
const suggestionRules = [
  {
    keywords: ['大米', '米', '面粉', '面条', '挂面'],
    condition: (items) => items.some(i => ['扫把', '拖把', '抹布', '清洁剂', '洁厕灵'].includes(i)),
    suggestion: '🧹 建议购买：拖把、洁厕灵、清洁剂'
  },
  {
    keywords: ['大米', '米', '面粉', '面条', '挂面'],
    condition: (items) => items.some(i => ['鸡蛋', '鸭蛋', '鹌鹑蛋'].includes(i)),
    suggestion: '🥬 建议购买：蔬菜搭配，如青菜、白菜、西红柿'
  },
  {
    keywords: ['蔬菜', '青菜', '白菜', '菠菜', '生菜', '西红柿', '黄瓜'],
    condition: (items) => items.some(i => ['面包片', '吐司', '馒头', '包子'].includes(i)) && !items.some(i => ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鱼', '虾', '蛋'].includes(i)),
    suggestion: '🥩 提醒：已购买主食和蔬菜，建议补充蛋白质（肉类、鸡蛋、鱼虾）'
  },
  {
    keywords: ['洗衣液', '洗衣粉', '肥皂'],
    condition: (items) => !items.some(i => ['衣架', '夹子', '晾衣架'].includes(i)),
    suggestion: '👕 建议购买：衣架或晾衣夹'
  },
  {
    keywords: ['洗发水', '沐浴露', '洗面奶'],
    condition: (items) => !items.some(i => ['毛巾', '牙刷', '牙膏', '漱口水'].includes(i)),
    suggestion: '🪥 建议购买：牙膏、牙刷或毛巾'
  },
  {
    keywords: ['纸巾', '卫生纸', '抽纸', '厨房纸'],
    condition: (items) => !items.some(i => ['垃圾袋', '塑料袋'].includes(i)),
    suggestion: '🗑️ 建议购买：垃圾袋'
  },
  {
    keywords: ['食用油', '油', '调和油', '花生油'],
    condition: (items) => !items.some(i => ['盐', '酱油', '醋', '调料', '味精'].includes(i)),
    suggestion: '🧂 建议购买：盐、酱油、醋等基础调料'
  },
  {
    keywords: ['拖鞋', '凉鞋'],
    condition: (items) => !items.some(i => ['棉拖', '棉鞋', '拖鞋'].includes(i)) && items.some(i => ['棉', '冬', '保暖'].includes(i)),
    suggestion: '🧦 建议购买：棉拖鞋（天冷了注意保暖）'
  },
  {
    keywords: ['水果', '苹果', '香蕉', '橙子', '葡萄'],
    condition: (items) => !items.some(i => ['坚果', '瓜子', '花生', '核桃'].includes(i)),
    suggestion: '🥜 建议搭配：坚果零食'
  },
  {
    keywords: ['啤酒', '白酒', '红酒', '葡萄酒'],
    condition: (items) => !items.some(i => ['花生', '瓜子', '坚果', '小吃', '零食'].includes(i)),
    suggestion: '🍺 建议搭配：花生、瓜子等下酒小食'
  },
  {
    keywords: ['可乐', '雪碧', '芬达', '饮料', '果汁'],
    condition: (items) => !items.some(i => ['矿泉水', '纯净水', '饮用水', '桶装水'].includes(i)),
    suggestion: '💧 建议购买：矿泉水或纯净水'
  },
  {
    keywords: ['酸奶', '纯牛奶', '酸牛奶'],
    condition: (items) => !items.some(i => ['面包', '吐司', '饼干', '蛋糕'].includes(i)),
    suggestion: '🍞 建议搭配：面包或饼干'
  },
  {
    keywords: ['火锅底料', '火锅'],
    condition: (items) => !items.some(i => ['羊肉', '牛肉', '肥牛', '虾滑', '丸子', '豆腐', '土豆', '藕', '金针菇'].includes(i)),
    suggestion: '🍲 建议购买：火锅配菜（肉丸、蔬菜、豆腐等）'
  }
];

// 获取智能建议
const getSuggestions = (recentItems) => {
  const suggestions = [];
  const itemNames = recentItems.map(item => item.item_name);

  for (const rule of suggestionRules) {
    // 检查是否包含关键词
    const hasKeyword = itemNames.some(name =>
      rule.keywords.some(keyword => name.includes(keyword))
    );

    if (hasKeyword && rule.condition(itemNames)) {
      suggestions.push(rule.suggestion);
    }
  }

  // 去重
  return [...new Set(suggestions)];
};

const createRecord = async (req, res) => {
  try {
    const { category, itemName, amount, recordDate, notes } = req.body;
    const userId = req.userId;

    if (!category || !itemName || !amount || !recordDate) {
      return res.status(400).json({ error: '类别、物品名称、金额和日期是必需的' });
    }

    const id = await ExpenseRecord.create({
      userId,
      category,
      itemName,
      amount,
      recordDate,
      notes: notes || null
    });

    const record = await ExpenseRecord.findById(id);
    res.status(201).json({ message: '记录添加成功', record });
  } catch (error) {
    console.error('创建消费记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const records = await ExpenseRecord.findByUserId(userId);
    res.json(records);
  } catch (error) {
    console.error('获取消费记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ExpenseRecord.findById(id);

    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权访问此记录' });
    }

    res.json(record);
  } catch (error) {
    console.error('获取消费记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, itemName, amount, recordDate, notes } = req.body;

    const record = await ExpenseRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权修改此记录' });
    }

    await ExpenseRecord.update(id, {
      category,
      itemName,
      amount,
      recordDate,
      notes
    });

    const updatedRecord = await ExpenseRecord.findById(id);
    res.json({ message: '记录更新成功', record: updatedRecord });
  } catch (error) {
    console.error('更新消费记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await ExpenseRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    if (record.user_id !== req.userId) {
      return res.status(403).json({ error: '无权删除此记录' });
    }

    await ExpenseRecord.delete(id);
    res.json({ message: '记录删除成功' });
  } catch (error) {
    console.error('删除消费记录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: '开始日期和结束日期是必需的' });
    }

    const stats = await ExpenseRecord.getStatsByDate(userId, startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取智能建议
const getSmartSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    // 获取最近30天的消费记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentRecords = await ExpenseRecord.findRecentByUserId(userId, dateStr);
    const suggestions = getSuggestions(recentRecords);

    res.json({ suggestions });
  } catch (error) {
    console.error('获取智能建议错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
  getStats,
  getSmartSuggestions
};
