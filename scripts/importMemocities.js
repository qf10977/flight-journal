import mongoose from 'mongoose'
import 'dotenv/config'

// 要导入的出行备忘录机场城市数据
const AIRPORT_CITIES = [
  // 一线城市
  { name: "北京", id: "101010100", airports: ["首都国际机场", "大兴国际机场"] },
  { name: "上海", id: "101020100", airports: ["浦东国际机场", "虹桥国际机场"] },
  { name: "广州", id: "101280101", airports: ["白云国际机场"] },
  { name: "深圳", id: "101280601", airports: ["宝安国际机场"] },
  
  // 其他主要城市
  { name: "杭州", id: "101210101", airports: ["萧山国际机场"] },
  { name: "南京", id: "101190101", airports: ["禄口国际机场"] },
  { name: "成都", id: "101270101", airports: ["双流国际机场", "天府国际机场"] },
  { name: "重庆", id: "101040100", airports: ["江北国际机场"] },
  { name: "西安", id: "101110101", airports: ["咸阳国际机场"] },
  { name: "武汉", id: "101200101", airports: ["天河国际机场"] },
  { name: "长沙", id: "101250101", airports: ["黄花国际机场"] },
  { name: "厦门", id: "101230201", airports: ["高崎国际机场"] },
  { name: "青岛", id: "101120201", airports: ["胶东国际机场"] },
  { name: "大连", id: "101070201", airports: ["周水子国际机场", "金州湾机场"] },
  { name: "三亚", id: "101310201", airports: ["凤凰国际机场", "三亚新国际机场"] },
  { name: "昆明", id: "101290101", airports: ["长水国际机场"] },
  { name: "海口", id: "101310101", airports: ["美兰国际机场"] },
  { name: "哈尔滨", id: "101050101", airports: ["太平国际机场"] },
  { name: "天津", id: "101030100", airports: ["滨海国际机场"] },
  { name: "沈阳", id: "101070101", airports: ["桃仙国际机场"] },
  
  // 省会城市和重要城市
  { name: "济南", id: "101120101", airports: ["遥墙国际机场"] },
  { name: "合肥", id: "101220101", airports: ["新桥国际机场"] },
  { name: "郑州", id: "101180101", airports: ["新郑国际机场"] },
  { name: "福州", id: "101230101", airports: ["长乐国际机场"] },
  { name: "南昌", id: "101240101", airports: ["昌北国际机场"] },
  { name: "长春", id: "101060101", airports: ["龙嘉国际机场"] },
  { name: "石家庄", id: "101090101", airports: ["正定国际机场"] },
  { name: "太原", id: "101100101", airports: ["武宿国际机场"] },
  { name: "呼和浩特", id: "101080101", airports: ["白塔国际机场"] },
  { name: "南宁", id: "101300101", airports: ["吴圩国际机场"] },
  
  // 旅游城市
  { name: "丽江", id: "101291401", airports: ["三义国际机场"] },
  { name: "桂林", id: "101300501", airports: ["两江国际机场"] },
  { name: "西双版纳", id: "101291601", airports: ["嘎洒国际机场"] },
  { name: "张家界", id: "101251101", airports: ["荷花国际机场"] },
  { name: "黄山", id: "101221001", airports: ["屯溪国际机场"] },
  { name: "拉萨", id: "101140101", airports: ["贡嘎国际机场"] },
  { name: "阿里", id: "101140701", airports: ["昆莎机场"] },
  { name: "香格里拉", id: "101291301", airports: ["迪庆机场"] },
  { name: "九寨沟", id: "101271901", airports: ["黄龙机场"] },
  { name: "敦煌", id: "101160801", airports: ["莫高国际机场"] },
  
  // 经济特区和开发区
  { name: "珠海", id: "101280701", airports: ["金湾国际机场"] },
  { name: "汕头", id: "101280501", airports: ["潮汕国际机场"] },
  { name: "苏州", id: "101190401", airports: ["硕放国际机场"] },
  { name: "无锡", id: "101190201", airports: ["硕放国际机场"] },
  { name: "宁波", id: "101210401", airports: ["栎社国际机场"] },
  { name: "温州", id: "101210701", airports: ["龙湾国际机场"] },
  { name: "烟台", id: "101120501", airports: ["蓬莱国际机场"] },
  { name: "威海", id: "101121301", airports: ["大水泊国际机场"] },
  { name: "徐州", id: "101190801", airports: ["观音国际机场"] },
  { name: "连云港", id: "101191001", airports: ["白塔埠机场"] },
  
  // 中部城市
  { name: "常州", id: "101191101", airports: ["奔牛国际机场"] },
  { name: "襄阳", id: "101200201", airports: ["刘集机场"] },
  { name: "洛阳", id: "101180901", airports: ["北郊机场"] },
  { name: "南阳", id: "101180701", airports: ["姜营机场"] },
  { name: "宜昌", id: "101200901", airports: ["三峡机场"] },
  { name: "岳阳", id: "101251001", airports: ["三荷机场"] },
  { name: "赣州", id: "101240701", airports: ["黄金机场"] },
  { name: "景德镇", id: "101240801", airports: ["罗家机场"] },
  { name: "九江", id: "101240201", airports: ["庐山机场"] },
  { name: "芜湖", id: "101220301", airports: ["宣城机场"] },
  
  // 西北城市
  { name: "兰州", id: "101160101", airports: ["中川国际机场"] },
  { name: "西宁", id: "101150101", airports: ["曹家堡国际机场"] },
  { name: "银川", id: "101170101", airports: ["河东国际机场"] },
  { name: "乌鲁木齐", id: "101130101", airports: ["地窝堡国际机场"] },
  { name: "喀什", id: "101130901", airports: ["喀什机场"] },
  { name: "吐鲁番", id: "101130501", airports: ["交河机场"] },
  { name: "伊宁", id: "101131001", airports: ["伊宁机场"] },
  { name: "库尔勒", id: "101130601", airports: ["库尔勒机场"] },
  { name: "阿克苏", id: "101130801", airports: ["阿克苏机场"] },
  { name: "克拉玛依", id: "101130201", airports: ["克拉玛依机场"] },
  
  // 东北城市
  { name: "牡丹江", id: "101050301", airports: ["海浪国际机场"] },
  { name: "佳木斯", id: "101050401", airports: ["东郊机场"] },
  { name: "齐齐哈尔", id: "101050201", airports: ["三家子机场"] },
  { name: "大庆", id: "101050901", airports: ["萨尔图机场"] },
  { name: "吉林", id: "101060201", airports: ["二台子机场"] },
  { name: "延吉", id: "101060301", airports: ["朝阳川国际机场"] },
  { name: "丹东", id: "101070601", airports: ["浪头国际机场"] },
  { name: "锦州", id: "101070701", airports: ["小岭子机场"] },
  { name: "鞍山", id: "101070301", airports: ["腾鳌机场"] },
  { name: "通化", id: "101060501", airports: ["三源浦机场"] },
  
  // 西南城市
  { name: "贵阳", id: "101260101", airports: ["龙洞堡国际机场"] },
  { name: "铜仁", id: "101260601", airports: ["凤凰机场"] },
  { name: "遵义", id: "101260201", airports: ["新舟机场", "茅台机场"] },
  { name: "黔江", id: "101041100", airports: ["武陵山机场"] },
  { name: "泸州", id: "101271001", airports: ["蓝田机场"] },
  { name: "绵阳", id: "101270401", airports: ["南郊机场"] },
  { name: "宜宾", id: "101271101", airports: [ "五粮液机场"] },
  { name: "南充", id: "101270501", airports: ["高坪机场"] },
  { name: "达州", id: "101270601", airports: ["河市机场"] },
  { name: "广元", id: "101272101", airports: ["盘龙机场"] },
  
  // 海南城市
  { name: "琼海", id: "101310201", airports: ["博鳌机场"] },
  { name: "儋州", id: "101310205", airports: ["那大机场"] },
  { name: "文昌", id: "101310212", airports: ["文昌航天发射场机场"] }
];

// 导入城市数据到MongoDB
async function importCities() {
  try {
    // 连接MongoDB数据库
    console.log('正在连接到MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('已连接到MongoDB');
    
    // 创建城市模型Schema
    const citySchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        unique: true
      },
      id: {
        type: String,
        required: true,
        unique: true
      },
      airports: [String]
    });
    
    // 清理之前的模型定义（如果存在）
    try {
      if (mongoose.models.MemoCity) {
        delete mongoose.models.MemoCity;
      }
    } catch (err) {
      console.log('清理模型失败，继续执行');
    }
    
    // 创建城市模型（使用集合名称 memocities）
    const MemoCity = mongoose.model('MemoCity', citySchema, 'memocities');
    
    // 检查并删除集合
    try {
      console.log('尝试删除现有集合...');
      await mongoose.connection.db.dropCollection('memocities');
      console.log('成功删除现有集合');
    } catch (err) {
      console.log('删除集合失败（可能不存在）:', err.message);
    }
    
    // 批量插入城市数据
    console.log('开始导入城市数据...');
    const result = await MemoCity.insertMany(AIRPORT_CITIES);
    console.log(`成功导入 ${result.length} 个出行备忘录城市数据`);
    
    // 关闭连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    
  } catch (error) {
    console.error('导入出行备忘录城市数据失败:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// 执行导入函数
importCities().catch(err => {
  console.error('导入过程中发生错误:', err);
  process.exit(1);
});