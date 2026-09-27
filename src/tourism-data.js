// 全国 34 省级行政区精选文旅名胜风物数据集（由 scripts/build-tourism.mjs 自动生成）
// 涵盖世界文化/自然遗产、国家 5A 级旅游景区、国家公园、五岳名山、高原圣湖与博物奇观
export const TOURISM_CATEGORIES = [
  { id: 'all', name: '全部风物', short: '全部' },
  { id: 'world', name: '世界遗产', short: '世遗' },
  { id: 'nature', name: '自然山岳', short: '山岳' },
  { id: 'heritage', name: '人文古迹', short: '古迹' },
  { id: 'water', name: '湖海秀水', short: '秀水' },
  { id: 'wonder', name: '博物奇观', short: '奇观' },
];

export const TOURISM_SPOTS = [
  {
    "id": "sp_001",
    "name": "故宫",
    "fullName": "北京故宫博物院（紫禁城）",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "110000",
    "city": "110000",
    "unit": "110101",
    "pos": [
      733.4,
      332.6
    ],
    "season": "四季皆宜 · 春秋最佳",
    "blurb": "明清两代皇家宫殿，世界现存规模最大、保存最完整的木质结构古建筑群。",
    "py": "gugong",
    "pi": "gg"
  },
  {
    "id": "sp_002",
    "name": "八达岭长城",
    "fullName": "八达岭—慕田峪长城",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "110000",
    "city": "110000",
    "unit": "110119",
    "pos": [
      726,
      323.4
    ],
    "season": "4–5月 · 9–11月",
    "blurb": "万里长城精华段，盘踞军都山崇山峻岭之巅，气势极其雄伟。",
    "py": "badalingchangcheng",
    "pi": "bdlcc"
  },
  {
    "id": "sp_003",
    "name": "颐和园",
    "fullName": "北京颐和园",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "110000",
    "city": "110000",
    "unit": "110108",
    "pos": [
      731.2,
      331
    ],
    "season": "4–10月",
    "blurb": "汲取江南造园精髓的清代皇家行宫御苑，昆明湖与万寿山相映成趣。",
    "py": "yiheyuan",
    "pi": "yhy"
  },
  {
    "id": "sp_004",
    "name": "天坛",
    "fullName": "北京天坛公园",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "110000",
    "city": "110000",
    "unit": "110101",
    "pos": [
      733.8,
      333.4
    ],
    "season": "四季皆宜",
    "blurb": "明清帝王祭天祈谷之所，祈年殿三重蓝瓦鎏金宝顶堪称中国古建形制典范。",
    "py": "tiantan",
    "pi": "tt"
  },
  {
    "id": "sp_005",
    "name": "明十三陵",
    "fullName": "明十三陵景区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "110000",
    "city": "110000",
    "unit": "110114",
    "pos": [
      729.6,
      324.5
    ],
    "season": "4–11月",
    "blurb": "明朝十三位皇帝陵寝聚落，依天寿山风水格局营建，神道石像生威严肃穆。",
    "py": "mingshisanling",
    "pi": "mssl"
  },
  {
    "id": "sp_006",
    "name": "国家博物馆",
    "fullName": "中国国家博物馆",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家一级博物馆",
    "tier": 2,
    "prov": "110000",
    "city": "110000",
    "unit": "110101",
    "pos": [
      733.5,
      332.9
    ],
    "season": "四季皆宜",
    "blurb": "中华五千年文明殿堂，馆藏后母戊鼎、四羊方尊等国之重器。",
    "py": "guojiabowuguan",
    "pi": "gjbwg"
  },
  {
    "id": "sp_007",
    "name": "盘山",
    "fullName": "天津蓟州盘山风景名胜区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "120000",
    "city": "120000",
    "unit": "120119",
    "pos": [
      747.7,
      326.9
    ],
    "season": "4–10月",
    "blurb": "以三盘暮雨、怪石奇松闻名的京东第一山，乾隆曾盛赞“早知有盘山，何必下江南”。",
    "py": "panshan",
    "pi": "ps"
  },
  {
    "id": "sp_008",
    "name": "五大道",
    "fullName": "天津五大道文化旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "120000",
    "city": "120000",
    "unit": "120103",
    "pos": [
      749.2,
      349.2
    ],
    "season": "4–11月",
    "blurb": "汇聚两千余栋近代各国风格花园洋房，被誉为“万国建筑博览苑”。",
    "py": "wudadao",
    "pi": "wdd"
  },
  {
    "id": "sp_009",
    "name": "古文化街",
    "fullName": "天津古文化街（津门故里）",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "120000",
    "city": "120000",
    "unit": "120105",
    "pos": [
      748.9,
      348.5
    ],
    "season": "四季皆宜",
    "blurb": "以天后宫为核心的津味民俗老街，泥人张、杨柳青年画荟萃于此。",
    "py": "guwenhuajie",
    "pi": "gwhj"
  },
  {
    "id": "sp_010",
    "name": "承德避暑山庄",
    "fullName": "承德避暑山庄及周围寺庙",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "130000",
    "city": "130800",
    "unit": "130802",
    "pos": [
      756,
      305.3
    ],
    "season": "5–10月",
    "blurb": "中国现存最大的古典皇家园林，浓缩塞北草原、江南水乡与外八庙藏式建筑艺术。",
    "py": "chengdebishushanzhuang",
    "pi": "cdbssz"
  },
  {
    "id": "sp_011",
    "name": "山海关",
    "fullName": "秦皇岛山海关景区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "130000",
    "city": "130300",
    "unit": "130303",
    "pos": [
      789.5,
      323.1
    ],
    "season": "5–10月",
    "blurb": "明万里长城东起入海处，“天下第一关”与老龙头入海石城雄峙渤海之滨。",
    "py": "shanhaiguan",
    "pi": "shg"
  },
  {
    "id": "sp_012",
    "name": "白洋淀",
    "fullName": "雄安白洋淀景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "130000",
    "city": "130600",
    "unit": "130632",
    "pos": [
      729.1,
      356.5
    ],
    "season": "6–9月荷花季",
    "blurb": "华北平原最大的淡水湖泊湿地，百里苇海纵横，夏季万亩红莲盛放。",
    "py": "baiyangdian",
    "pi": "byd"
  },
  {
    "id": "sp_013",
    "name": "野三坡",
    "fullName": "保定涞水野三坡景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "130000",
    "city": "130600",
    "unit": "130623",
    "pos": [
      717,
      340.2
    ],
    "season": "5–10月",
    "blurb": "太行山与燕山交汇处的嶂谷奇观，百里峡一线天幽深清凉。",
    "py": "yesanpo",
    "pi": "ysp"
  },
  {
    "id": "sp_014",
    "name": "清东陵",
    "fullName": "唐山遵化清东陵",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "130000",
    "city": "130200",
    "unit": "130281",
    "pos": [
      753.7,
      324
    ],
    "season": "4–10月",
    "blurb": "清代规模最宏大的帝王后妃陵寝群，孝陵、裕陵、慈禧定东陵坐落昌瑞山下。",
    "py": "qingdongling",
    "pi": "qdl"
  },
  {
    "id": "sp_015",
    "name": "西柏坡",
    "fullName": "石家庄平山西柏坡景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "130000",
    "city": "130100",
    "unit": "130131",
    "pos": [
      695.7,
      372.7
    ],
    "season": "4–11月",
    "blurb": "太行山东麓滹沱河畔的革命圣地，“新中国从这里走来”。",
    "py": "xibaipo",
    "pi": "xbp"
  },
  {
    "id": "sp_016",
    "name": "云冈石窟",
    "fullName": "大同云冈石窟",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "140000",
    "city": "140200",
    "unit": "140214",
    "pos": [
      678.4,
      333.7
    ],
    "season": "4–10月",
    "blurb": "北魏皇家开凿的砂岩佛教石窟艺术巅峰，昙曜五窟大佛雄浑磅礴。",
    "py": "yungangshiku",
    "pi": "ygsk"
  },
  {
    "id": "sp_017",
    "name": "五台山",
    "fullName": "忻州五台山风景名胜区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化景观遗产 · 5A",
    "tier": 1,
    "prov": "140000",
    "city": "140900",
    "unit": "140922",
    "pos": [
      688.2,
      357.7
    ],
    "season": "5–10月",
    "blurb": "中国四大佛教名山之首，保存有唐代佛光寺东大殿、南禅寺等稀世唐代木构。",
    "py": "wutaishan",
    "pi": "wts"
  },
  {
    "id": "sp_018",
    "name": "平遥古城",
    "fullName": "晋中平遥古城",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "140000",
    "city": "140700",
    "unit": "140728",
    "pos": [
      667.3,
      400.8
    ],
    "season": "四季皆宜",
    "blurb": "中国保存最完整的明清县城样本，日昇昌票号开创中国近代金融先河。",
    "py": "pingyaogucheng",
    "pi": "pygc"
  },
  {
    "id": "sp_019",
    "name": "壶口瀑布",
    "fullName": "临汾吉县黄河壶口瀑布",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "140000",
    "city": "141000",
    "unit": "141028",
    "pos": [
      638.3,
      426.7
    ],
    "season": "4–5月 · 9–11月",
    "blurb": "千里黄河一壶收，滚滚黄水倾泻入晋陕石槽，涛声如雷、水雾升腾成虹。",
    "py": "hukoupubu",
    "pi": "hkpb"
  },
  {
    "id": "sp_020",
    "name": "乔家大院",
    "fullName": "晋中祁县晋商大院群",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "晋商古建代表",
    "tier": 2,
    "prov": "140000",
    "city": "140700",
    "unit": "140727",
    "pos": [
      671.2,
      396.2
    ],
    "season": "4–10月",
    "blurb": "北方传统民居建筑典范，砖雕、木雕、石雕精美绝伦。",
    "py": "qiaojiadayuan",
    "pi": "qjdy"
  },
  {
    "id": "sp_021",
    "name": "悬空寺·恒山",
    "fullName": "大同浑源北岳恒山与悬空寺",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "重点文保 · 名岳",
    "tier": 2,
    "prov": "140000",
    "city": "140200",
    "unit": "140225",
    "pos": [
      688.9,
      343
    ],
    "season": "4–10月",
    "blurb": "金龙峡峭壁之上凌空构筑的佛道儒三教合一古寺，历经千载岿然不动。",
    "py": "xuankongsihengshan",
    "pi": "xkshs"
  },
  {
    "id": "sp_022",
    "name": "皇城相府",
    "fullName": "晋城阳城皇城相府",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "140000",
    "city": "140500",
    "unit": "140522",
    "pos": [
      677.1,
      439.3
    ],
    "season": "4–10月",
    "blurb": "清代名相陈廷敬故居，依山筑造的明清官宦城堡式建筑群。",
    "py": "huangchengxiangfu",
    "pi": "hcxf"
  },
  {
    "id": "sp_023",
    "name": "呼伦贝尔大草原",
    "fullName": "呼伦贝尔大草原莫尔格勒河景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "150000",
    "city": "150700",
    "unit": "150702",
    "pos": [
      760.8,
      114.4
    ],
    "season": "6–9月",
    "blurb": "世界四大草原之一，莫尔格勒河“天下第一曲水”在无垠绿毯上蜿蜒流淌。",
    "py": "hulunbeierdacaoyuan",
    "pi": "hlbedcy"
  },
  {
    "id": "sp_024",
    "name": "响沙湾",
    "fullName": "鄂尔多斯达拉特旗响沙湾",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "150000",
    "city": "150600",
    "unit": "150621",
    "pos": [
      624.9,
      334.3
    ],
    "season": "5–10月",
    "blurb": "库布其沙漠东端的月牙形大沙丘，滑沙时沙粒轰鸣如蛙声雷动。",
    "py": "xiangshawan",
    "pi": "xsw"
  },
  {
    "id": "sp_025",
    "name": "成吉思汗陵",
    "fullName": "鄂尔多斯伊金霍洛旗成吉思汗陵",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "150000",
    "city": "150600",
    "unit": "150627",
    "pos": [
      623,
      354
    ],
    "season": "5–10月",
    "blurb": "达尔扈特人世代守护的蒙古族圣地，保留古老神秘的祭祀文化。",
    "py": "chengjisihanling",
    "pi": "cjshl"
  },
  {
    "id": "sp_026",
    "name": "阿尔山",
    "fullName": "兴安盟阿尔山国家森林公园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "150000",
    "city": "152200",
    "unit": "152202",
    "pos": [
      774.8,
      159.4
    ],
    "season": "6–10月秋色",
    "blurb": "大兴安岭西南麓的高山火山地貌群，驼峰岭天池与杜鹃湖秋日金黄绚烂。",
    "py": "aershan",
    "pi": "aes"
  },
  {
    "id": "sp_027",
    "name": "额济纳胡杨林",
    "fullName": "阿拉善盟额济纳胡杨林旅游区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "150000",
    "city": "152900",
    "unit": "152923",
    "pos": [
      477.8,
      296.1
    ],
    "season": "10月上中旬",
    "blurb": "弱水河畔四十五万亩戈壁胡杨，每年深秋化作金色火焰海洋。",
    "py": "ejinahuyanglin",
    "pi": "ejnhyl"
  },
  {
    "id": "sp_028",
    "name": "阿斯哈图石林",
    "fullName": "赤峰克什克腾石阵景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "150000",
    "city": "150400",
    "unit": "150425",
    "pos": [
      742.1,
      238.8
    ],
    "season": "6–9月",
    "blurb": "第四纪冰川与风蚀雕琢出的花岗岩层状石林，巍然屹立于草原山脊之上。",
    "py": "asihatushilin",
    "pi": "ashtsl"
  },
  {
    "id": "sp_029",
    "name": "沈阳故宫",
    "fullName": "沈阳故宫博物院",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "210000",
    "city": "210100",
    "unit": "210103",
    "pos": [
      843,
      272.9
    ],
    "season": "四季皆宜",
    "blurb": "清朝入关前营建的盛京皇宫，大政殿与十王亭极具满蒙八旗营帐建筑特色。",
    "py": "shenyanggugong",
    "pi": "sygg"
  },
  {
    "id": "sp_030",
    "name": "金石滩",
    "fullName": "大连金石滩国家旅游度假区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "210000",
    "city": "210200",
    "unit": "210213",
    "pos": [
      830,
      337.7
    ],
    "season": "5–10月",
    "blurb": "黄海之滨绵延三十公里的震旦纪古生物化石海岸，素有“神力雕塑公园”之称。",
    "py": "jinshitan",
    "pi": "jst"
  },
  {
    "id": "sp_031",
    "name": "本溪水洞",
    "fullName": "本溪水洞景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "210000",
    "city": "210500",
    "unit": "210521",
    "pos": [
      855.4,
      282.1
    ],
    "season": "四季恒温",
    "blurb": "世界罕见的大型充水溶洞，泛舟地下暗河可赏万千钟乳奇石。",
    "py": "benxishuidong",
    "pi": "bxsd"
  },
  {
    "id": "sp_032",
    "name": "千山",
    "fullName": "鞍山千山风景名胜区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "210000",
    "city": "210300",
    "unit": "210302",
    "pos": [
      841,
      291.3
    ],
    "season": "4–10月",
    "blurb": "长白山支脉千朵莲花山，“无峰不奇、无石不峭”，天成弥勒大佛蔚为壮观。",
    "py": "qianshan",
    "pi": "qs"
  },
  {
    "id": "sp_033",
    "name": "红海滩",
    "fullName": "盘锦红海滩国家风景廊道",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产湿地 · 5A",
    "tier": 2,
    "prov": "210000",
    "city": "211100",
    "unit": "211122",
    "pos": [
      818.5,
      297.7
    ],
    "season": "9–10月最红",
    "blurb": "辽河入海口辽阔滩涂上的碱蓬草湿地，深秋铺展成无边无际的赤红画卷。",
    "py": "honghaitan",
    "pi": "hht"
  },
  {
    "id": "sp_034",
    "name": "长白山",
    "fullName": "长白山景区（天池）",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 1,
    "prov": "220000",
    "city": "220600",
    "unit": "220621",
    "pos": [
      915.8,
      252.6
    ],
    "season": "7–9月 · 冬季冰雪",
    "blurb": "中朝界山休眠火山，海拔 2189 米火山口天池碧蓝如玉，飞流化作长白瀑布。",
    "py": "changbaishan",
    "pi": "cbs"
  },
  {
    "id": "sp_035",
    "name": "伪满皇宫",
    "fullName": "长春伪满皇宫博物院",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "220000",
    "city": "220100",
    "unit": "220102",
    "pos": [
      863.8,
      220.2
    ],
    "season": "四季皆宜",
    "blurb": "中国近代史重要遗址博物馆，见证东北十四年沧桑历史。",
    "py": "weimanhuanggong",
    "pi": "wmhg"
  },
  {
    "id": "sp_036",
    "name": "净月潭",
    "fullName": "长春净月潭景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "220000",
    "city": "220100",
    "unit": "220102",
    "pos": [
      866.1,
      222.4
    ],
    "season": "夏秋避暑 · 冬滑越野雪",
    "blurb": "亚洲最大人工森林环抱的弯月形碧水，四季林海浩瀚。",
    "py": "jingyuetan",
    "pi": "jyt"
  },
  {
    "id": "sp_037",
    "name": "雾凇岛",
    "fullName": "吉林松花江雾凇岛景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "中国四大自然奇观",
    "tier": 2,
    "prov": "220000",
    "city": "220200",
    "unit": "220203",
    "pos": [
      880.8,
      212.5
    ],
    "season": "12月–次年2月",
    "blurb": "严冬松花江不冻江水蒸腾凝结于岸柳松枝，千树万树梨花开。",
    "py": "wusongdao",
    "pi": "wsd"
  },
  {
    "id": "sp_038",
    "name": "高句丽王城",
    "fullName": "通化集安高句丽文物古迹",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "220000",
    "city": "220500",
    "unit": "220582",
    "pos": [
      890.1,
      278.2
    ],
    "season": "5–10月",
    "blurb": "鸭绿江畔的丸都山城与将军坟，被誉为“东方金字塔”。",
    "py": "gaojuliwangcheng",
    "pi": "gjlwc"
  },
  {
    "id": "sp_039",
    "name": "五大连池",
    "fullName": "黑河五大连池世界地质公园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 1,
    "prov": "230000",
    "city": "231100",
    "unit": "231182",
    "pos": [
      853.3,
      112.3
    ],
    "season": "6–9月",
    "blurb": "十四座新老期火山锥与五座火山堰塞湖串珠相连，被誉为“天然火山博物馆”。",
    "py": "wudalianchi",
    "pi": "wdlc"
  },
  {
    "id": "sp_040",
    "name": "太阳岛·冰雪大世界",
    "fullName": "哈尔滨太阳岛与冰雪大世界",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "230000",
    "city": "230100",
    "unit": "230109",
    "pos": [
      874,
      174.8
    ],
    "season": "6–9月避暑 · 12–2月冰雪",
    "blurb": "松花江北岸的生态明珠，冬日化作举世闻名的梦幻冰雕琉璃王国。",
    "py": "taiyangdaobingxuedashijie",
    "pi": "tydbxdsj"
  },
  {
    "id": "sp_041",
    "name": "镜泊湖",
    "fullName": "牡丹江宁安镜泊湖景区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "230000",
    "city": "231000",
    "unit": "231084",
    "pos": [
      919.2,
      207.6
    ],
    "season": "6–10月",
    "blurb": "万年火山熔岩阻塞牡丹江形成的高山堰塞湖，吊水楼瀑布黑石翻浪。",
    "py": "jingbohu",
    "pi": "jbh"
  },
  {
    "id": "sp_042",
    "name": "扎龙湿地",
    "fullName": "齐齐哈尔扎龙生态旅游区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国际重要湿地 · 4A",
    "tier": 2,
    "prov": "230000",
    "city": "230200",
    "unit": "230204",
    "pos": [
      832.3,
      151.3
    ],
    "season": "5–10月",
    "blurb": "乌裕尔河下游广袤芦苇沼泽，世界最大的野生丹顶鹤栖息繁殖地。",
    "py": "zhalongshidi",
    "pi": "zlsd"
  },
  {
    "id": "sp_043",
    "name": "北极村",
    "fullName": "大兴安岭漠河北极村",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "230000",
    "city": "232700",
    "unit": "232701",
    "pos": [
      780.3,
      20.6
    ],
    "season": "夏至极昼 · 隆冬寻北",
    "blurb": "中国大陆最北端的黑龙江畔边陲村落，夏至可赏白夜与极光奇景。",
    "py": "beijicun",
    "pi": "bjc"
  },
  {
    "id": "sp_044",
    "name": "汤旺河石林",
    "fullName": "伊春汤旺河林海奇石景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "230000",
    "city": "230700",
    "unit": "230723",
    "pos": [
      904.9,
      106.3
    ],
    "season": "6–10月",
    "blurb": "小兴安岭红松原始林海与印支期花岗岩球状风化石林共生奇观。",
    "py": "tangwangheshilin",
    "pi": "twhsl"
  },
  {
    "id": "sp_045",
    "name": "外滩·东方明珠",
    "fullName": "上海外滩与陆家嘴东方明珠",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "310000",
    "city": "310000",
    "unit": "310115",
    "pos": [
      851,
      515.1
    ],
    "season": "四季皆宜 · 夜景尤佳",
    "blurb": "黄浦江两岸百年万国建筑博览群与摩天都市天际线交汇的魔都名片。",
    "py": "waitandongfangmingzhu",
    "pi": "wtdfmz"
  },
  {
    "id": "sp_046",
    "name": "豫园",
    "fullName": "上海城隍庙与豫园",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "全国重点文保",
    "tier": 2,
    "prov": "310000",
    "city": "310000",
    "unit": "310115",
    "pos": [
      851,
      515.4
    ],
    "season": "四季皆宜",
    "blurb": "始建于明代的江南古典园林，九曲桥湖心亭与太湖石“玉玲珑”名闻遐迩。",
    "py": "yuyuan",
    "pi": "yy"
  },
  {
    "id": "sp_047",
    "name": "朱家角古镇",
    "fullName": "上海青浦朱家角水乡古镇",
    "cat": "water",
    "worldHeritage": false,
    "badge": "中国历史文化名镇",
    "tier": 2,
    "prov": "310000",
    "city": "310000",
    "unit": "310118",
    "pos": [
      843.3,
      519.3
    ],
    "season": "3–11月",
    "blurb": "淀山湖畔千年江南水乡，五孔石拱放生桥横跨漕港河。",
    "py": "zhujiajiaoguzhen",
    "pi": "zjjgz"
  },
  {
    "id": "sp_048",
    "name": "苏州园林",
    "fullName": "苏州古典园林（拙政园·留园）",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "320000",
    "city": "320500",
    "unit": "320508",
    "pos": [
      834.6,
      515.8
    ],
    "season": "3–11月",
    "blurb": "咫尺之内再造乾坤，以水石亭榭写意江南文人山水理想的世界造园巅峰。",
    "py": "suzhouyuanlin",
    "pi": "szyl"
  },
  {
    "id": "sp_049",
    "name": "中山陵·明孝陵",
    "fullName": "南京钟山风景名胜区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "320000",
    "city": "320100",
    "unit": "320113",
    "pos": [
      799.2,
      504.2
    ],
    "season": "3–11月 · 深秋梧桐",
    "blurb": "紫金山麓六朝胜迹，明孝陵神道石刻与中山陵博爱建筑群苍翠庄严。",
    "py": "zhongshanlingmingxiaoling",
    "pi": "zslmxl"
  },
  {
    "id": "sp_050",
    "name": "夫子庙·秦淮河",
    "fullName": "南京夫子庙—秦淮风光带",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "320000",
    "city": "320100",
    "unit": "320104",
    "pos": [
      798.2,
      505.3
    ],
    "season": "四季皆宜",
    "blurb": "十里秦淮烟水画舫，江南贡院与乌衣巷承载金陵千年文脉。",
    "py": "fuzimiaoqinhuaihe",
    "pi": "fzmqhh"
  },
  {
    "id": "sp_051",
    "name": "瘦西湖",
    "fullName": "扬州瘦西湖风景区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "大运河世遗点 · 5A",
    "tier": 2,
    "prov": "320000",
    "city": "321000",
    "unit": "321003",
    "pos": [
      808.7,
      495
    ],
    "season": "3–5月烟花三月",
    "blurb": "两堤花柳全依水，五亭桥与白塔勾勒出清秀婉约的湖上园林长卷。",
    "py": "shouxihu",
    "pi": "sxh"
  },
  {
    "id": "sp_052",
    "name": "鼋头渚",
    "fullName": "无锡太湖鼋头渚风景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "320000",
    "city": "320200",
    "unit": "320211",
    "pos": [
      826.4,
      512.6
    ],
    "season": "3–4月樱花 · 秋日太湖",
    "blurb": "太湖西北岸横深入水的巨石半岛，春来三万株樱花如云似雪。",
    "py": "yuantouzhu",
    "pi": "ytz"
  },
  {
    "id": "sp_053",
    "name": "周庄古镇",
    "fullName": "昆山周庄古镇景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "320000",
    "city": "320500",
    "unit": "320509",
    "pos": [
      839.5,
      519.8
    ],
    "season": "四季皆宜",
    "blurb": "“中国第一水乡”，双桥流水人家、沈厅张厅完好留存明清江南风貌。",
    "py": "zhouzhuangguzhen",
    "pi": "zzgz"
  },
  {
    "id": "sp_054",
    "name": "云龙湖·汉文化",
    "fullName": "徐州云龙湖与两汉文化景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "320000",
    "city": "320300",
    "unit": "320311",
    "pos": [
      761.8,
      459.4
    ],
    "season": "4–10月",
    "blurb": "青山抱碧水，狮子山楚王陵与汉兵马俑展现大汉雄风。",
    "py": "yunlonghuhanwenhua",
    "pi": "ylhhwh"
  },
  {
    "id": "sp_055",
    "name": "黄海湿地·中华麋鹿园",
    "fullName": "盐城大丰中华麋鹿园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 2,
    "prov": "320000",
    "city": "320900",
    "unit": "320904",
    "pos": [
      832,
      476.4
    ],
    "season": "4–11月",
    "blurb": "黄（渤）海候鸟栖息地核心区，世界最大野生麋鹿种群家园。",
    "py": "huanghaishidizhonghuamiluyuan",
    "pi": "hhsdzhmly"
  },
  {
    "id": "sp_056",
    "name": "杭州西湖",
    "fullName": "杭州西湖文化景观",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "330000",
    "city": "330100",
    "unit": "330106",
    "pos": [
      829.4,
      541.3
    ],
    "season": "四季皆宜",
    "blurb": "三面云山一面城，“一山二塔三岛三堤”凝练了中国千年山水美学意境。",
    "py": "hangzhouxihu",
    "pi": "hzxh"
  },
  {
    "id": "sp_057",
    "name": "良渚古城",
    "fullName": "杭州良渚古城遗址",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "330000",
    "city": "330100",
    "unit": "330110",
    "pos": [
      826,
      538.4
    ],
    "season": "四季皆宜",
    "blurb": "实证中华五千年文明史的圣地，拥有规模宏大的史前城址、外围水利系统与玉琮礼制。",
    "py": "liangzhugucheng",
    "pi": "lzgc"
  },
  {
    "id": "sp_058",
    "name": "普陀山",
    "fullName": "舟山普陀山风景名胜区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "330000",
    "city": "330900",
    "unit": "330903",
    "pos": [
      872.4,
      539.7
    ],
    "season": "4–11月",
    "blurb": "东海舟山群岛中的“海天佛国”，普济、法雨、慧济三大寺掩映于金沙碧浪间。",
    "py": "putuoshan",
    "pi": "pts"
  },
  {
    "id": "sp_059",
    "name": "千岛湖",
    "fullName": "杭州淳安千岛湖景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "330000",
    "city": "330100",
    "unit": "330127",
    "pos": [
      810.1,
      559.1
    ],
    "season": "4–11月",
    "blurb": "1078 座翠岛星罗棋布于澄澈湖面，水下沉睡着千年贺城与狮城古迹。",
    "py": "qiandaohu",
    "pi": "qdh"
  },
  {
    "id": "sp_060",
    "name": "乌镇",
    "fullName": "嘉兴桐乡乌镇古镇景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "330000",
    "city": "330400",
    "unit": "330483",
    "pos": [
      834,
      529.1
    ],
    "season": "四季皆宜",
    "blurb": "京杭大运河畔的枕水人家，东栅原味市井与西栅夜色桨声相得益彰。",
    "py": "wuzhen",
    "pi": "wz"
  },
  {
    "id": "sp_061",
    "name": "雁荡山",
    "fullName": "温州乐清雁荡山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "330000",
    "city": "330300",
    "unit": "330382",
    "pos": [
      853.9,
      580.3
    ],
    "season": "4–11月",
    "blurb": "白垩纪流纹岩古火山杰作，灵峰夜景、灵岩飞渡与大龙湫瀑布合称“雁荡三绝”。",
    "py": "yandangshan",
    "pi": "yds"
  },
  {
    "id": "sp_062",
    "name": "神仙居",
    "fullName": "台州仙居神仙居景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "330000",
    "city": "331000",
    "unit": "331024",
    "pos": [
      843.6,
      574.5
    ],
    "season": "4–11月",
    "blurb": "流纹岩峰林拔地而起，如意桥与观音峰在云海间宛若仙境。",
    "py": "shenxianju",
    "pi": "sxj"
  },
  {
    "id": "sp_063",
    "name": "黄山",
    "fullName": "黄山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界文化与自然双遗产 · 5A",
    "tier": 1,
    "prov": "340000",
    "city": "341000",
    "unit": "341003",
    "pos": [
      792.4,
      549.2
    ],
    "season": "四季皆宜",
    "blurb": "“五岳归来不看山，黄山归来不看岳”，以奇松、怪石、云海、温泉、冬雪冠绝天下。",
    "py": "huangshan",
    "pi": "hs"
  },
  {
    "id": "sp_064",
    "name": "宏村·西递",
    "fullName": "黄山黟县皖南古村落（西递·宏村）",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "340000",
    "city": "341000",
    "unit": "341023",
    "pos": [
      789.4,
      552.7
    ],
    "season": "3–11月",
    "blurb": "粉墙黛瓦马头墙倒映南湖月沼，牛形水系古村落被誉为“中国画里的乡村”。",
    "py": "hongcunxidi",
    "pi": "hcxd"
  },
  {
    "id": "sp_065",
    "name": "九华山",
    "fullName": "池州九华山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "340000",
    "city": "341700",
    "unit": "341723",
    "pos": [
      784.5,
      542.3
    ],
    "season": "4–11月",
    "blurb": "中国佛教四大名山之一，九十九峰如莲花竞放，化城寺与百岁宫古刹幽深。",
    "py": "jiuhuashan",
    "pi": "jhs"
  },
  {
    "id": "sp_066",
    "name": "天柱山",
    "fullName": "安庆潜山天柱山景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "340000",
    "city": "340800",
    "unit": "340882",
    "pos": [
      758.4,
      540
    ],
    "season": "4–11月",
    "blurb": "古南岳天柱峰一柱擎天，拥有世界罕见的超高压变质带地质奇观。",
    "py": "tianzhushan",
    "pi": "tzs"
  },
  {
    "id": "sp_067",
    "name": "徽州古城",
    "fullName": "黄山歙县古徽州文化旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "340000",
    "city": "341000",
    "unit": "341021",
    "pos": [
      798.3,
      554.5
    ],
    "season": "四季皆宜",
    "blurb": "中国四大古城之一，许国石坊八脚牌楼与棠樾牌坊群镌刻徽州人文底蕴。",
    "py": "huizhougucheng",
    "pi": "hzgc"
  },
  {
    "id": "sp_068",
    "name": "武夷山",
    "fullName": "南平武夷山国家公园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界文化与自然双遗产 · 5A",
    "tier": 1,
    "prov": "350000",
    "city": "350700",
    "unit": "350782",
    "pos": [
      795.7,
      605.3
    ],
    "season": "3–11月",
    "blurb": "碧水丹山完美交融，九曲溪竹筏漂流穿行于三十六峰丹霞赤壁与朱子理学科考遗迹间。",
    "py": "wuyishan",
    "pi": "wys"
  },
  {
    "id": "sp_069",
    "name": "鼓浪屿",
    "fullName": "厦门鼓浪屿历史国际社区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "350000",
    "city": "350200",
    "unit": "350203",
    "pos": [
      807.2,
      676.1
    ],
    "season": "四季皆宜",
    "blurb": "碧海环抱的“琴岛”，日光岩下中西合璧的历史建筑群与巷弄花影交相辉映。",
    "py": "gulangyu",
    "pi": "gly"
  },
  {
    "id": "sp_070",
    "name": "福建土楼",
    "fullName": "龙岩永定·漳州南靖福建土楼",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "350000",
    "city": "350800",
    "unit": "350803",
    "pos": [
      785.2,
      674
    ],
    "season": "四季皆宜",
    "blurb": "闽西南大山深处的生土夯筑巨型聚族民居，振成楼、田螺坑“四菜一汤”举世无双。",
    "py": "fujiantulou",
    "pi": "fjtl"
  },
  {
    "id": "sp_071",
    "name": "三坊七巷",
    "fullName": "福州三坊七巷历史文化街区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "350000",
    "city": "350100",
    "unit": "350102",
    "pos": [
      826.8,
      636.5
    ],
    "season": "四季皆宜",
    "blurb": "里坊制度活化石，“一片三坊七巷，半部中国近代史”，走出林则徐、严复等名贤。",
    "py": "sanfangqixiang",
    "pi": "sfqx"
  },
  {
    "id": "sp_072",
    "name": "泉州开元寺·清源山",
    "fullName": "泉州：宋元中国的世界海洋商贸中心",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "350000",
    "city": "350500",
    "unit": "350503",
    "pos": [
      816.3,
      664.3
    ],
    "season": "四季皆宜",
    "blurb": "海上丝绸之路起点，东西双塔、老君岩与洛阳桥见证“刺桐港”梯航万国之盛。",
    "py": "quanzhoukaiyuansiqingyuanshan",
    "pi": "qzkysqys"
  },
  {
    "id": "sp_073",
    "name": "太姥山·霞浦",
    "fullName": "宁德福鼎太姥山与霞浦滩涂",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "350000",
    "city": "350900",
    "unit": "350982",
    "pos": [
      841,
      611.2
    ],
    "season": "4–11月",
    "blurb": "“海上仙都”花岗岩峰丛洞穴奇险，山脚下霞浦滩涂光影变幻无穷。",
    "py": "tailaoshanxiapu",
    "pi": "tlsxp"
  },
  {
    "id": "sp_074",
    "name": "庐山",
    "fullName": "九江庐山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "360000",
    "city": "360400",
    "unit": "360483",
    "pos": [
      752.6,
      567.1
    ],
    "season": "四季皆宜 · 盛夏避暑",
    "blurb": "匡庐奇秀甲天下，雄峙长江与鄱阳湖之间，三叠泉飞瀑与白鹿洞书院人文荟萃。",
    "py": "lushan",
    "pi": "ls"
  },
  {
    "id": "sp_075",
    "name": "三清山",
    "fullName": "上饶三清山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "360000",
    "city": "361100",
    "unit": "361123",
    "pos": [
      794.3,
      576.8
    ],
    "season": "4–11月",
    "blurb": "花岗岩微地貌天然博物馆，“东方女神”与“巨蟒出山”奇峰绝世独立。",
    "py": "sanqingshan",
    "pi": "sqs"
  },
  {
    "id": "sp_076",
    "name": "婺源篁岭·江湾",
    "fullName": "上饶婺源江湾与篁岭景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "360000",
    "city": "361100",
    "unit": "361130",
    "pos": [
      790.9,
      567.2
    ],
    "season": "3–4月油菜花 · 10–11月晒秋",
    "blurb": "徽派古村掩映于梯田花海，秋季家家户户竹匾晒秋绘就大地调色盘。",
    "py": "wuyuanhuanglingjiangwan",
    "pi": "wyhljw"
  },
  {
    "id": "sp_077",
    "name": "景德镇古窑",
    "fullName": "景德镇古窑民俗博览区与御窑厂",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "360000",
    "city": "360200",
    "unit": "360202",
    "pos": [
      776.1,
      570.3
    ],
    "season": "四季皆宜",
    "blurb": "千年瓷都活态非遗工坊，历代名窑复烧重现“白如玉、明如镜、声如磬”的青花神韵。",
    "py": "jingdezhenguyao",
    "pi": "jdzgy"
  },
  {
    "id": "sp_078",
    "name": "滕王阁",
    "fullName": "南昌滕王阁旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "360000",
    "city": "360100",
    "unit": "360102",
    "pos": [
      752.7,
      587.1
    ],
    "season": "四季皆宜",
    "blurb": "赣江东岸的江南三大名楼之一，因王勃“落霞与孤鹜齐飞，秋水共长天一色”名扬千古。",
    "py": "tengwangge",
    "pi": "twg"
  },
  {
    "id": "sp_079",
    "name": "龙虎山",
    "fullName": "鹰潭龙虎山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 2,
    "prov": "360000",
    "city": "360600",
    "unit": "360681",
    "pos": [
      775.2,
      597.4
    ],
    "season": "3–11月",
    "blurb": "中国丹霞地貌发育成熟期代表，泸溪河碧水曲折、绝壁古越悬棺神秘莫测。",
    "py": "longhushan",
    "pi": "lhs"
  },
  {
    "id": "sp_080",
    "name": "井冈山",
    "fullName": "吉安井冈山风景旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "360000",
    "city": "360800",
    "unit": "360881",
    "pos": [
      724,
      637.6
    ],
    "season": "4–10月 · 杜鹃花季",
    "blurb": "罗霄山脉中段的“中国革命摇篮”，五指峰苍茫翠竹环抱。",
    "py": "jinggangshan",
    "pi": "jgs"
  },
  {
    "id": "sp_081",
    "name": "泰山",
    "fullName": "泰安泰山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界文化与自然双遗产 · 5A",
    "tier": 1,
    "prov": "370000",
    "city": "370900",
    "unit": "370902",
    "pos": [
      755.3,
      413.8
    ],
    "season": "4–11月",
    "blurb": "五岳独尊，自秦汉以来历代帝王封禅祭天圣山，十八盘石阶直通南天门与玉皇顶。",
    "py": "taishan",
    "pi": "ts"
  },
  {
    "id": "sp_082",
    "name": "曲阜三孔",
    "fullName": "济宁曲阜孔庙、孔林、孔府",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "370000",
    "city": "370800",
    "unit": "370881",
    "pos": [
      755.2,
      429
    ],
    "season": "四季皆宜",
    "blurb": "儒家文化发源圣地，大成殿盘龙石柱与万古长春牌坊承载两千五百年礼乐文脉。",
    "py": "qufusankong",
    "pi": "qfsk"
  },
  {
    "id": "sp_083",
    "name": "天下第一泉（趵突泉·大明湖）",
    "fullName": "济南天下第一泉风景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "370000",
    "city": "370100",
    "unit": "370103",
    "pos": [
      752.7,
      404.9
    ],
    "season": "四季皆宜",
    "blurb": "“四面荷花三面柳，一城山色半城湖”，趵突泉三股清泉昼夜喷涌不息。",
    "py": "tianxiadiyiquanbaotuquandaminghu",
    "pi": "txdyqbtqdmh"
  },
  {
    "id": "sp_084",
    "name": "崂山",
    "fullName": "青岛崂山风景名胜区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "370000",
    "city": "370200",
    "unit": "370212",
    "pos": [
      817.3,
      407.2
    ],
    "season": "4–11月",
    "blurb": "中国海岸线第一高峰，“海上第一名山”山海相连，太清宫道教源远流长。",
    "py": "laoshan",
    "pi": "ls"
  },
  {
    "id": "sp_085",
    "name": "蓬莱阁",
    "fullName": "烟台蓬莱阁旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "370000",
    "city": "370600",
    "unit": "370614",
    "pos": [
      813.6,
      369.6
    ],
    "season": "5–10月",
    "blurb": "凌空高踞丹崖山巅的中国四大名楼之一，黄渤海交界处偶现海市蜃楼奇观。",
    "py": "penglaige",
    "pi": "plg"
  },
  {
    "id": "sp_086",
    "name": "台儿庄古城",
    "fullName": "枣庄台儿庄古城景区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "大运河世遗点 · 5A",
    "tier": 2,
    "prov": "370000",
    "city": "370400",
    "unit": "370405",
    "pos": [
      771.3,
      450.8
    ],
    "season": "四季皆宜",
    "blurb": "京杭大运河中心点上的“天下第一庄”，兼具北方大院与江南水乡风韵。",
    "py": "taierzhuanggucheng",
    "pi": "tezgc"
  },
  {
    "id": "sp_087",
    "name": "刘公岛",
    "fullName": "威海刘公岛景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "370000",
    "city": "371000",
    "unit": "371002",
    "pos": [
      839.3,
      372.7
    ],
    "season": "5–10月",
    "blurb": "威海湾口的海上森林公园，北洋水师提督署遗址铭记甲午海战历史。",
    "py": "liugongdao",
    "pi": "lgd"
  },
  {
    "id": "sp_088",
    "name": "龙门石窟",
    "fullName": "洛阳龙门石窟",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "410000",
    "city": "410300",
    "unit": "410311",
    "pos": [
      676.8,
      460.5
    ],
    "season": "3–11月",
    "blurb": "伊水两岸峭壁上的十万余尊石刻造像，奉先寺卢舍那大佛展现盛唐恢弘气象。",
    "py": "longmenshiku",
    "pi": "lmsk"
  },
  {
    "id": "sp_089",
    "name": "少林寺·嵩山",
    "fullName": "郑州登封嵩山少林景区（天地之中）",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "410000",
    "city": "410300",
    "unit": "410381",
    "pos": [
      685.4,
      460.9
    ],
    "season": "3–11月",
    "blurb": "中岳嵩山腹地的禅宗祖庭与少林武术发源地，塔林与嵩阳书院冠绝中州。",
    "py": "shaolinsisongshan",
    "pi": "slsss"
  },
  {
    "id": "sp_090",
    "name": "殷墟",
    "fullName": "安阳殷墟景区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "410000",
    "city": "410500",
    "unit": "410505",
    "pos": [
      706.7,
      422.1
    ],
    "season": "四季皆宜",
    "blurb": "中国商代晚期都城遗址，甲骨文与妇好墓青铜器将中国信史向上推进数百年。",
    "py": "yinxu",
    "pi": "yx"
  },
  {
    "id": "sp_091",
    "name": "清明上河园",
    "fullName": "开封清明上河园",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "410000",
    "city": "410200",
    "unit": "410202",
    "pos": [
      709.8,
      451.9
    ],
    "season": "3–11月",
    "blurb": "以张择端《清明上河图》为蓝本再现北宋东京汴梁漕运繁华与市井百态。",
    "py": "qingmingshangheyuan",
    "pi": "qmshy"
  },
  {
    "id": "sp_092",
    "name": "云台山",
    "fullName": "焦作修武云台山风景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "410000",
    "city": "410800",
    "unit": "410821",
    "pos": [
      691.3,
      439.4
    ],
    "season": "4–11月",
    "blurb": "太行山南麓红石峡丹崖碧水峡谷地貌，云台天瀑落差达 314 米。",
    "py": "yuntaishan",
    "pi": "yts"
  },
  {
    "id": "sp_093",
    "name": "老君山",
    "fullName": "洛阳栾川老君山景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "410000",
    "city": "410300",
    "unit": "410324",
    "pos": [
      663.2,
      480.3
    ],
    "season": "四季皆宜 · 冬雪金顶",
    "blurb": "八百里伏牛山主峰，海拔两千二百米马鬃岭峰林之巅矗立金殿道观群。",
    "py": "laojunshan",
    "pi": "ljs"
  },
  {
    "id": "sp_094",
    "name": "武当山",
    "fullName": "十堰武当山古建筑群",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "420000",
    "city": "420300",
    "unit": "420381",
    "pos": [
      653.3,
      511.1
    ],
    "season": "3–11月",
    "blurb": "道教第一名山，天柱峰绝顶铜铸鎏金殿与紫霄宫依山就势，尽显“天人合一”哲思。",
    "py": "wudangshan",
    "pi": "wds"
  },
  {
    "id": "sp_095",
    "name": "三峡大坝·三峡人家",
    "fullName": "宜昌长江三峡（大坝·三峡人家）",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "420000",
    "city": "420500",
    "unit": "420506",
    "pos": [
      655.5,
      546.8
    ],
    "season": "3–11月",
    "blurb": "西陵峡中段的大国重器水利工程与巴楚悬棺、帆影峡江画卷。",
    "py": "sanxiadabasanxiarenjia",
    "pi": "sxdbsxrj"
  },
  {
    "id": "sp_096",
    "name": "黄鹤楼",
    "fullName": "武汉黄鹤楼公园",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "420000",
    "city": "420100",
    "unit": "420106",
    "pos": [
      718.3,
      548.3
    ],
    "season": "四季皆宜",
    "blurb": "蛇山之巅俯瞰万里长江与武汉长江大桥，享有“天下江山第一楼”美誉。",
    "py": "huanghelou",
    "pi": "hhl"
  },
  {
    "id": "sp_097",
    "name": "神农架",
    "fullName": "神农架国家公园生态旅游区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "420000",
    "city": "429021",
    "unit": "429021",
    "pos": [
      641.9,
      532.9
    ],
    "season": "5–10月",
    "blurb": "华中屋脊神农顶海拔 3106 米，大九湖高山湿地与金丝猴原始森林秘境。",
    "py": "shennongjia",
    "pi": "snj"
  },
  {
    "id": "sp_098",
    "name": "恩施大峡谷",
    "fullName": "恩施大峡谷景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "420000",
    "city": "422800",
    "unit": "422801",
    "pos": [
      621.2,
      557.3
    ],
    "season": "4–11月",
    "blurb": "清江流域喀斯特绝壁长廊，“一柱香”高达 150 米傲立群峰之间。",
    "py": "enshidaxiagu",
    "pi": "esdxg"
  },
  {
    "id": "sp_099",
    "name": "湖北省博物馆",
    "fullName": "武汉东湖与湖北省博物馆",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "420000",
    "city": "420100",
    "unit": "420106",
    "pos": [
      719.4,
      547.8
    ],
    "season": "四季皆宜",
    "blurb": "东湖之滨楚文化宝库，越王勾践剑、曾侯乙编钟震惊世界。",
    "py": "hubeishengbowuguan",
    "pi": "hbsbwg"
  },
  {
    "id": "sp_100",
    "name": "张家界武陵源·天门山",
    "fullName": "张家界武陵源—天门山风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "430000",
    "city": "430800",
    "unit": "430811",
    "pos": [
      647.4,
      581.1
    ],
    "season": "4–11月",
    "blurb": "三千奇峰拔地而起的石英砂岩峰林绝景，天门洞凌空穿山、云雾蒸腾。",
    "py": "zhangjiajiewulingyuantianmenshan",
    "pi": "zjjwlytms"
  },
  {
    "id": "sp_101",
    "name": "南岳衡山",
    "fullName": "衡阳南岳衡山旅游区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区 · 五岳",
    "tier": 2,
    "prov": "430000",
    "city": "430400",
    "unit": "430412",
    "pos": [
      693.8,
      624.3
    ],
    "season": "四季皆宜 · 冬雾凇",
    "blurb": "五岳独秀，祝融峰高耸云端，山脚南岳大庙规制宏大、佛道同尊。",
    "py": "nanyuehengshan",
    "pi": "nyhs"
  },
  {
    "id": "sp_102",
    "name": "岳阳楼·君山岛",
    "fullName": "岳阳楼—洞庭湖君山岛景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "430000",
    "city": "430600",
    "unit": "430621",
    "pos": [
      697.5,
      576.5
    ],
    "season": "4–11月",
    "blurb": "衔远山、吞长江，浩浩汤汤横无际涯，范仲淹《岳阳楼记》精神坐标。",
    "py": "yueyangloujunshandao",
    "pi": "yyljsd"
  },
  {
    "id": "sp_103",
    "name": "凤凰古城",
    "fullName": "湘西凤凰古城旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "430000",
    "city": "433100",
    "unit": "433123",
    "pos": [
      631.9,
      613
    ],
    "season": "3–11月",
    "blurb": "沱江穿城而过，吊脚楼群、虹桥风雨楼与沈从文笔下的边城湘西风情。",
    "py": "fenghuanggucheng",
    "pi": "fhgc"
  },
  {
    "id": "sp_104",
    "name": "橘子洲·岳麓山",
    "fullName": "长沙岳麓山—橘子洲旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "430000",
    "city": "430100",
    "unit": "430104",
    "pos": [
      696.9,
      603.6
    ],
    "season": "四季皆宜 · 深秋爱晚亭",
    "blurb": "湘江心洲百舸争流，千年学府岳麓书院与爱晚亭红叶相映。",
    "py": "juzizhouyuelushan",
    "pi": "jzzyls"
  },
  {
    "id": "sp_105",
    "name": "崀山",
    "fullName": "邵阳新宁崀山景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 2,
    "prov": "430000",
    "city": "430500",
    "unit": "430528",
    "pos": [
      657.1,
      647.6
    ],
    "season": "4–11月",
    "blurb": "丹霞之魂，鲸鱼闹海、辣椒峰与天一巷展示壮年早期丹霞峰丛绝色。",
    "py": "langshan",
    "pi": "ls"
  },
  {
    "id": "sp_106",
    "name": "丹霞山",
    "fullName": "韶关仁化丹霞山景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "440000",
    "city": "440200",
    "unit": "440224",
    "pos": [
      718.6,
      672.9
    ],
    "season": "四季皆宜",
    "blurb": "全球“丹霞地貌”命名地，赤壁丹崖六百八十余座，阳元石与长老峰鬼斧神工。",
    "py": "danxiashan",
    "pi": "dxs"
  },
  {
    "id": "sp_107",
    "name": "开平碉楼",
    "fullName": "江门开平碉楼与村落",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "440000",
    "city": "440700",
    "unit": "440783",
    "pos": [
      699.4,
      735.5
    ],
    "season": "四季皆宜",
    "blurb": "五邑侨乡稻田竹林间耸立的千余座中西合璧防卫式多层塔楼。",
    "py": "kaipingdiaolou",
    "pi": "kpdl"
  },
  {
    "id": "sp_108",
    "name": "广州塔·白云山",
    "fullName": "广州塔与白云山风景名胜区",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "440000",
    "city": "440100",
    "unit": "440105",
    "pos": [
      713.8,
      716.2
    ],
    "season": "四季皆宜",
    "blurb": "珠江新中轴线上的“小蛮腰”地标与羊城第一秀白云山遥相呼应。",
    "py": "guangzhoutabaiyunshan",
    "pi": "gztbys"
  },
  {
    "id": "sp_109",
    "name": "港珠澳大桥·长隆",
    "fullName": "珠海情侣路—港珠澳大桥旅游区",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "世纪工程 · 湾区地标",
    "tier": 2,
    "prov": "440000",
    "city": "440400",
    "unit": "440402",
    "pos": [
      720.9,
      735
    ],
    "season": "四季皆宜",
    "blurb": "跨越伶仃洋的世界最长跨海大桥，桥岛隧一体连接粤港澳三地。",
    "py": "gangzhuaodaqiaochanglong",
    "pi": "gzadqcl"
  },
  {
    "id": "sp_110",
    "name": "西樵山",
    "fullName": "佛山南海西樵山景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "440000",
    "city": "440600",
    "unit": "440605",
    "pos": [
      706.9,
      720.7
    ],
    "season": "四季皆宜",
    "blurb": "珠江三角洲平原上拔地而起的死火山绿岛，岭南理学与黄飞鸿醒狮文化发源地。",
    "py": "xiqiaoshan",
    "pi": "xqs"
  },
  {
    "id": "sp_111",
    "name": "罗浮山",
    "fullName": "惠州博罗罗浮山景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "440000",
    "city": "441300",
    "unit": "441322",
    "pos": [
      727.7,
      711.4
    ],
    "season": "四季皆宜",
    "blurb": "“岭南第一山”，道教十大洞天之第七洞天，葛洪在此炼丹著书。",
    "py": "luofushan",
    "pi": "lfs"
  },
  {
    "id": "sp_112",
    "name": "湖光岩",
    "fullName": "湛江湖光岩玛珥湖世界地质公园",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界地质公园 · 4A",
    "tier": 2,
    "prov": "440000",
    "city": "440800",
    "unit": "440811",
    "pos": [
      653.4,
      763.8
    ],
    "season": "四季皆宜",
    "blurb": "雷州半岛保存极完整的火山爆发冷却陷落玛珥湖，湖水清澈见底。",
    "py": "huguangyan",
    "pi": "hgy"
  },
  {
    "id": "sp_113",
    "name": "桂林山水·漓江",
    "fullName": "桂林漓江与阳朔喀斯特景区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "450000",
    "city": "450300",
    "unit": "450321",
    "pos": [
      653,
      679.8
    ],
    "season": "4–11月",
    "blurb": "“桂林山水甲天下”，百里漓江青峰夹岸、黄布倒影与九马画山如水墨长卷。",
    "py": "guilinshanshuilijiang",
    "pi": "glsslj"
  },
  {
    "id": "sp_114",
    "name": "德天跨国瀑布",
    "fullName": "崇左大新德天跨国瀑布景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "450000",
    "city": "451400",
    "unit": "451424",
    "pos": [
      577.7,
      728.6
    ],
    "season": "6–11月丰水期",
    "blurb": "中越边境归春河上的亚洲第一大跨国瀑布，三级跌落气势磅礴。",
    "py": "detiankuaguopubu",
    "pi": "dtkgpb"
  },
  {
    "id": "sp_115",
    "name": "花山岩画",
    "fullName": "崇左宁明左江花山岩画文化景观",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 4A",
    "tier": 2,
    "prov": "450000",
    "city": "451400",
    "unit": "451423",
    "pos": [
      584,
      741.8
    ],
    "season": "四季皆宜",
    "blurb": "明江绝壁上两千年前骆越先民绘制的赭红色巨幅铜鼓祭祀岩画群。",
    "py": "huashanyanhua",
    "pi": "hsyh"
  },
  {
    "id": "sp_116",
    "name": "涠洲岛",
    "fullName": "北海涠洲岛南湾鳄鱼山景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "450000",
    "city": "450500",
    "unit": "450502",
    "pos": [
      628.7,
      767.6
    ],
    "season": "4–11月",
    "blurb": "北部湾碧海中的中国最年轻火山岛，海蚀崖洞与五彩滩珊瑚礁斑斓壮美。",
    "py": "weizhoudao",
    "pi": "wzd"
  },
  {
    "id": "sp_117",
    "name": "龙脊梯田",
    "fullName": "桂林龙胜龙脊梯田景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "全球重要农业遗产",
    "tier": 2,
    "prov": "450000",
    "city": "450300",
    "unit": "450328",
    "pos": [
      645.2,
      661.6
    ],
    "season": "5–6月灌水 · 9–10月金秋",
    "blurb": "从山脚盘绕至海拔千米山巅的壮瑶世代梯田，行云流水般勾勒大地曲线。",
    "py": "longjititian",
    "pi": "ljtt"
  },
  {
    "id": "sp_118",
    "name": "青秀山",
    "fullName": "南宁青秀山旅游区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "450000",
    "city": "450100",
    "unit": "450103",
    "pos": [
      612.2,
      729.3
    ],
    "season": "四季皆宜",
    "blurb": "邕江之畔的亚热带植物王国与绿城翡翠，龙象塔傲立山巅。",
    "py": "qingxiushan",
    "pi": "qxs"
  },
  {
    "id": "sp_119",
    "name": "南山·天涯海角",
    "fullName": "三亚南山文化旅游区与天涯海角",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "460000",
    "city": "460200",
    "unit": "460205",
    "pos": [
      633.3,
      827.4
    ],
    "season": "10月–次年4月最佳",
    "blurb": "南海之滨108米海上观音圣像凌波伫立，天涯石与海角石耸立椰林碧海间。",
    "py": "nanshantianyahaijiao",
    "pi": "nstyhj"
  },
  {
    "id": "sp_120",
    "name": "蜈支洲岛·亚龙湾",
    "fullName": "三亚蜈支洲岛旅游区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "460000",
    "city": "460200",
    "unit": "460202",
    "pos": [
      645.4,
      826.4
    ],
    "season": "四季皆宜",
    "blurb": "海水能见度极高的热带珊瑚岛屿，被誉为“中国马尔代夫”。",
    "py": "wuzhizhoudaoyalongwan",
    "pi": "wzzdylw"
  },
  {
    "id": "sp_121",
    "name": "热带雨林·呀诺达",
    "fullName": "保亭呀诺达与海南热带雨林国家公园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "国家公园 · 5A",
    "tier": 2,
    "prov": "460000",
    "city": "469029",
    "unit": "469029",
    "pos": [
      642.5,
      823.4
    ],
    "season": "四季皆宜",
    "blurb": "中国唯一分布于岛屿型热带雨林的国家公园，海南长臂猿唯一栖息地。",
    "py": "redaiyulinyanuoda",
    "pi": "rdylynd"
  },
  {
    "id": "sp_122",
    "name": "分界洲岛",
    "fullName": "陵水分界洲岛旅游区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "460000",
    "city": "469028",
    "unit": "469028",
    "pos": [
      654.7,
      820.1
    ],
    "season": "四季皆宜",
    "blurb": "琼南北气候分界线上的灵秀海岛，悬崖灯塔与蔚蓝珊瑚海交相辉映。",
    "py": "fenjiezhoudao",
    "pi": "fjzd"
  },
  {
    "id": "sp_123",
    "name": "大足石刻",
    "fullName": "重庆大足石刻（宝顶山·北山）",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "500000",
    "city": "500000",
    "unit": "500111",
    "pos": [
      557.1,
      574.5
    ],
    "season": "四季皆宜",
    "blurb": "世界石窟艺术史上最后的丰碑，千手观音金碧辉煌，世俗化造像栩栩如生。",
    "py": "dazushike",
    "pi": "dzsk"
  },
  {
    "id": "sp_124",
    "name": "武隆天生三桥",
    "fullName": "重庆武隆喀斯特旅游区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "500000",
    "city": "500000",
    "unit": "500156",
    "pos": [
      595.9,
      580.9
    ],
    "season": "4–11月",
    "blurb": "天龙桥、青龙桥、黑龙桥三座规模宏大的天然石拱桥横跨百米天坑峡谷。",
    "py": "wulongtianshengsanqiao",
    "pi": "wltssq"
  },
  {
    "id": "sp_125",
    "name": "白帝城·瞿塘峡",
    "fullName": "奉节白帝城—瞿塘峡景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "500000",
    "city": "500000",
    "unit": "500236",
    "pos": [
      628.2,
      543.2
    ],
    "season": "四季皆宜 · 11月红叶",
    "blurb": "三峡西首夔门天下雄，10元人民币背面图案取景地，诗城奉节千古流芳。",
    "py": "baidichengqutangxia",
    "pi": "bdcqtx"
  },
  {
    "id": "sp_126",
    "name": "洪崖洞·朝天门",
    "fullName": "重庆两江交汇与洪崖洞民俗风貌区",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "山城夜景地标",
    "tier": 2,
    "prov": "500000",
    "city": "500000",
    "unit": "500108",
    "pos": [
      572.3,
      578.5
    ],
    "season": "四季皆宜 · 夜景尤佳",
    "blurb": "嘉陵江与长江交汇处，依山而建的巴渝吊脚楼群夜色流光溢彩。",
    "py": "hongyadongchaotianmen",
    "pi": "hydctm"
  },
  {
    "id": "sp_127",
    "name": "金佛山",
    "fullName": "重庆南川金佛山景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 2,
    "prov": "500000",
    "city": "500000",
    "unit": "500119",
    "pos": [
      584.2,
      590.4
    ],
    "season": "四季皆宜 · 冬雪杜鹃",
    "blurb": "大娄山脉北端桌山喀斯特台原，绝壁栈道凌空环绕，古杜鹃与银杉珍稀罕见。",
    "py": "jinfoshan",
    "pi": "jfs"
  },
  {
    "id": "sp_128",
    "name": "九寨沟",
    "fullName": "阿坝九寨沟风景名胜区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "510000",
    "city": "513200",
    "unit": "513225",
    "pos": [
      522.1,
      497.1
    ],
    "season": "9–11月彩林最佳",
    "blurb": "“九寨归来不看水”，108 个高山钙华彩池、诺日朗叠瀑与雪峰原始森林交织成童话世界。",
    "py": "jiuzhaigou",
    "pi": "jzg"
  },
  {
    "id": "sp_129",
    "name": "峨眉山·乐山大佛",
    "fullName": "乐山大佛与峨眉山风景名胜区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化与自然双遗产 · 5A",
    "tier": 1,
    "prov": "510000",
    "city": "511100",
    "unit": "511181",
    "pos": [
      512.8,
      579.4
    ],
    "season": "四季皆宜",
    "blurb": "三江汇流处高 71 米的唐代摩崖石刻弥勒坐佛，与海拔 3079 米的峨眉金顶云海佛光相望。",
    "py": "emeishanleshandafo",
    "pi": "emslsdf"
  },
  {
    "id": "sp_130",
    "name": "都江堰·青城山",
    "fullName": "成都青城山—都江堰旅游景区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "510000",
    "city": "510100",
    "unit": "510181",
    "pos": [
      515.7,
      546
    ],
    "season": "四季皆宜",
    "blurb": "李冰父子修筑的无坝引水工程造就天府之国两千余年富庶，青城山“青城天下幽”道骨仙风。",
    "py": "dujiangyanqingchengshan",
    "pi": "djyqcs"
  },
  {
    "id": "sp_131",
    "name": "稻城亚丁",
    "fullName": "甘孜稻城亚丁景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "510000",
    "city": "513300",
    "unit": "513337",
    "pos": [
      450.2,
      602.7
    ],
    "season": "5–6月 · 9–10月",
    "blurb": "横断山脉腹地的“蓝色星球上最后一片净土”，仙乃日、央迈勇、夏诺多吉三座雪山圣洁巍峨。",
    "py": "daochengyading",
    "pi": "dcyd"
  },
  {
    "id": "sp_132",
    "name": "三星堆",
    "fullName": "广汉三星堆博物馆与遗址",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "古蜀文明瑰宝",
    "tier": 1,
    "prov": "510000",
    "city": "510600",
    "unit": "510681",
    "pos": [
      526.9,
      546.1
    ],
    "season": "四季皆宜",
    "blurb": "沉睡数千年一醒惊天下，青铜神树、纵目面具与黄金权杖揭开古蜀王国神秘面纱。",
    "py": "sanxingdui",
    "pi": "sxd"
  },
  {
    "id": "sp_133",
    "name": "大熊猫基地",
    "fullName": "四川大熊猫栖息地（成都基地·卧龙）",
    "cat": "wonder",
    "worldHeritage": true,
    "badge": "世界自然遗产",
    "tier": 2,
    "prov": "510000",
    "city": "510100",
    "unit": "510108",
    "pos": [
      525.8,
      552.1
    ],
    "season": "四季皆宜",
    "blurb": "国宝大熊猫繁育研究与高山竹林栖息家园。",
    "py": "daxiongmaojidi",
    "pi": "dxmjd"
  },
  {
    "id": "sp_134",
    "name": "黄龙",
    "fullName": "阿坝松潘黄龙风景名胜区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 2,
    "prov": "510000",
    "city": "513200",
    "unit": "513224",
    "pos": [
      520.3,
      506.4
    ],
    "season": "6–10月",
    "blurb": "岷山主峰雪宝顶下三千余个五彩钙华池层层叠叠，恰似金色巨龙蜿蜒林海。",
    "py": "huanglong",
    "pi": "hl"
  },
  {
    "id": "sp_135",
    "name": "剑门关",
    "fullName": "广元剑阁剑门蜀道剑门关旅游区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "510000",
    "city": "510800",
    "unit": "510823",
    "pos": [
      552.3,
      519
    ],
    "season": "3–11月",
    "blurb": "大剑山七十二峰形若利剑，李白叹“剑阁峥嵘而崔嵬，一夫当关，万夫莫开”。",
    "py": "jianmenguan",
    "pi": "jmg"
  },
  {
    "id": "sp_136",
    "name": "阆中古城",
    "fullName": "南充阆中古城旅游区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "510000",
    "city": "511300",
    "unit": "511381",
    "pos": [
      560.2,
      533.5
    ],
    "season": "四季皆宜",
    "blurb": "嘉陵江三面环绕、四面青山合抱的中国四大古城之一，唐代天文学家落下闳故里。",
    "py": "langzhonggucheng",
    "pi": "lzgc"
  },
  {
    "id": "sp_137",
    "name": "黄果树瀑布",
    "fullName": "安顺镇宁黄果树大瀑布景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "520000",
    "city": "520400",
    "unit": "520424",
    "pos": [
      555.3,
      659
    ],
    "season": "6–10月丰水期",
    "blurb": "亚洲第一大瀑布群，高 77.8 米、宽 101 米，水帘洞穿瀑而过可听万练飞空。",
    "py": "huangguoshupubu",
    "pi": "hgspb"
  },
  {
    "id": "sp_138",
    "name": "梵净山",
    "fullName": "铜仁梵净山景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "520000",
    "city": "520600",
    "unit": "520621",
    "pos": [
      614.3,
      614.7
    ],
    "season": "4–11月",
    "blurb": "武陵山脉主峰，孤峰突兀的红云金顶与蘑菇石凌立云端，黔金丝猴唯一栖息地。",
    "py": "fanjingshan",
    "pi": "fjs"
  },
  {
    "id": "sp_139",
    "name": "荔波大小七孔",
    "fullName": "黔南荔波樟江风景名胜区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "520000",
    "city": "522700",
    "unit": "522722",
    "pos": [
      597.3,
      674.7
    ],
    "season": "4–11月",
    "blurb": "地球腰带上的“绿宝石”，响水河上清代七孔石桥与翠谷叠水翡翠般澄澈。",
    "py": "libodaxiaoqikong",
    "pi": "lbdxqk"
  },
  {
    "id": "sp_140",
    "name": "西江千户苗寨",
    "fullName": "黔东南雷山西江千户苗寨",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "中国最大苗族古寨",
    "tier": 2,
    "prov": "520000",
    "city": "522600",
    "unit": "522634",
    "pos": [
      605.3,
      646.8
    ],
    "season": "四季皆宜",
    "blurb": "白水河畔四座山梁上层叠铺展的千余座木质吊脚楼，夜幕下万家灯火辉煌。",
    "py": "xijiangqianhumiaozhai",
    "pi": "xjqhmz"
  },
  {
    "id": "sp_141",
    "name": "中国天眼 FAST",
    "fullName": "黔南平塘中国天眼景区",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "大国重器天文奇观",
    "tier": 2,
    "prov": "520000",
    "city": "522700",
    "unit": "522727",
    "pos": [
      579.2,
      666.3
    ],
    "season": "四季皆宜",
    "blurb": "口径 500 米的世界最大单口径球面射电望远镜，坐落于喀斯特大窝凼天坑之中。",
    "py": "zhongguotianyanfast",
    "pi": "zgtyfast"
  },
  {
    "id": "sp_142",
    "name": "织金洞",
    "fullName": "毕节织金洞世界地质公园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 2,
    "prov": "520000",
    "city": "520500",
    "unit": "520524",
    "pos": [
      559.6,
      641.5
    ],
    "season": "四季恒温",
    "blurb": "“黄山归来不看岳，织金洞外无洞天”，霸王盔、银雨树等岩溶沉积形态包罗万象。",
    "py": "zhijindong",
    "pi": "zjd"
  },
  {
    "id": "sp_143",
    "name": "丽江古城·玉龙雪山",
    "fullName": "丽江古城与玉龙雪山景区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "530000",
    "city": "530700",
    "unit": "530721",
    "pos": [
      447.5,
      637
    ],
    "season": "四季皆宜",
    "blurb": "玉龙十三峰终年积雪映照下的纳西大研古镇，小桥流水四方街传承东巴古韵。",
    "py": "lijiangguchengyulongxueshan",
    "pi": "ljgcylxs"
  },
  {
    "id": "sp_144",
    "name": "大理苍山洱海·崇圣寺三塔",
    "fullName": "大理苍山洱海与崇圣寺三塔",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "530000",
    "city": "532900",
    "unit": "532901",
    "pos": [
      444.5,
      663.2
    ],
    "season": "四季如春",
    "blurb": "苍山十九峰十九溪屏列于西，百里洱海碧波荡漾于东，风花雪月千古佳话。",
    "py": "dalicangshanerhaichongshengsisanta",
    "pi": "dlcsehcssst"
  },
  {
    "id": "sp_145",
    "name": "石林",
    "fullName": "昆明石林风景名胜区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "530000",
    "city": "530100",
    "unit": "530126",
    "pos": [
      508,
      685.1
    ],
    "season": "四季如春",
    "blurb": "两亿七千万年雕琢的剑状喀斯特峰林博物馆，阿诗玛石峰亭亭玉立。",
    "py": "shilin",
    "pi": "sl"
  },
  {
    "id": "sp_146",
    "name": "哈尼梯田",
    "fullName": "红河元阳哈尼梯田文化景观",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 4A",
    "tier": 1,
    "prov": "530000",
    "city": "532500",
    "unit": "532528",
    "pos": [
      495.4,
      722.7
    ],
    "season": "11月–次年4月灌水期",
    "blurb": "哀牢山南部哈尼族人开垦千年的万亩云上梯田，森林、村寨、梯田、水系四素同构。",
    "py": "hanititian",
    "pi": "hntt"
  },
  {
    "id": "sp_147",
    "name": "普达措·香格里拉",
    "fullName": "迪庆香格里拉普达措国家公园",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "三江并流世遗 · 5A",
    "tier": 2,
    "prov": "530000",
    "city": "533400",
    "unit": "533401",
    "pos": [
      443.1,
      615.3
    ],
    "season": "5–10月",
    "blurb": "“三江并流”世界自然遗产核心区，属都湖、碧塔海高山草甸与原始云杉林静谧绝美。",
    "py": "pudacuoxianggelila",
    "pi": "pdcxgll"
  },
  {
    "id": "sp_148",
    "name": "西双版纳植物园",
    "fullName": "中科院西双版纳热带植物园",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "530000",
    "city": "532800",
    "unit": "532823",
    "pos": [
      463.7,
      748.1
    ],
    "season": "四季皆宜",
    "blurb": "罗梭江环抱的葫芦形半岛，汇聚上万种热带奇花异卉、王莲与望天树。",
    "py": "xishuangbannazhiwuyuan",
    "pi": "xsbnzwy"
  },
  {
    "id": "sp_149",
    "name": "腾冲火山热海",
    "fullName": "保山腾冲火山热海旅游区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "530000",
    "city": "530500",
    "unit": "530581",
    "pos": [
      409.2,
      677.9
    ],
    "season": "四季皆宜 · 秋季银杏",
    "blurb": "新生代火山群与沸泉大滚锅共生的地热奇观。",
    "py": "tengchonghuoshanrehai",
    "pi": "tchsrh"
  },
  {
    "id": "sp_150",
    "name": "布达拉宫·大昭寺",
    "fullName": "拉萨布达拉宫历史建筑群",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "540000",
    "city": "540100",
    "unit": "540102",
    "pos": [
      276.5,
      558
    ],
    "season": "5–10月",
    "blurb": "屹立于玛布日山之巅的世界海拔最高宫堡建筑群，红白宫墙与金顶在高原日光下熠熠生辉。",
    "py": "budalagongdazhaosi",
    "pi": "bdlgdzs"
  },
  {
    "id": "sp_151",
    "name": "珠穆朗玛峰",
    "fullName": "日喀则定日珠穆朗玛峰景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "世界最高峰 · 8848.86米",
    "tier": 1,
    "prov": "540000",
    "city": "540200",
    "unit": "540223",
    "pos": [
      190.3,
      582.1
    ],
    "season": "4–5月 · 9–10月",
    "blurb": "地球之巅，绒布寺仰望珠峰北坡旗云飘扬与日照金山。",
    "py": "zhumulangmafeng",
    "pi": "zmlmf"
  },
  {
    "id": "sp_152",
    "name": "纳木错",
    "fullName": "拉萨当雄—那曲班戈纳木错景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "西藏三大圣湖之首",
    "tier": 1,
    "prov": "540000",
    "city": "540600",
    "unit": "540627",
    "pos": [
      270.2,
      532.7
    ],
    "season": "5–10月",
    "blurb": "念青唐古拉山主峰北麓海拔 4718 米的“天湖”，湖水湛蓝如宝石。",
    "py": "namucuo",
    "pi": "nmc"
  },
  {
    "id": "sp_153",
    "name": "雅鲁藏布大峡谷·南迦巴瓦",
    "fullName": "林芝雅鲁藏布大峡谷景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "540000",
    "city": "540400",
    "unit": "540422",
    "pos": [
      348.9,
      567.5
    ],
    "season": "3–4月桃花 · 10–11月秋色",
    "blurb": "世界最深最长峡谷围绕海拔 7782 米的“中国最美雪山”南迦巴瓦峰作马蹄形大拐弯。",
    "py": "yalucangbudaxiagunanjiabawa",
    "pi": "ylcbdxgnjbw"
  },
  {
    "id": "sp_154",
    "name": "冈仁波齐·玛旁雍错",
    "fullName": "阿里普兰冈仁波齐与玛旁雍错",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "冈底斯山主峰 · 圣湖",
    "tier": 2,
    "prov": "540000",
    "city": "542500",
    "unit": "542521",
    "pos": [
      99.3,
      491.7
    ],
    "season": "5–10月",
    "blurb": "海拔 6656 米的四壁对称金字塔形雪峰，与高原淡水圣湖玛旁雍错相依。",
    "py": "gangrenboqimapangyongcuo",
    "pi": "grbqmpyc"
  },
  {
    "id": "sp_155",
    "name": "扎什伦布寺",
    "fullName": "日喀则扎什伦布寺景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "540000",
    "city": "540200",
    "unit": "540202",
    "pos": [
      232.2,
      560.2
    ],
    "season": "5–10月",
    "blurb": "尼色日山麓的后藏最大寺院，强巴佛殿供奉世界最大铜塑坐式弥勒佛像。",
    "py": "zhashenlunbusi",
    "pi": "zslbs"
  },
  {
    "id": "sp_156",
    "name": "羊卓雍错",
    "fullName": "山南浪卡子羊卓雍错景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "西藏三大圣湖",
    "tier": 2,
    "prov": "540000",
    "city": "540500",
    "unit": "540531",
    "pos": [
      266.5,
      573
    ],
    "season": "5–10月",
    "blurb": "蜿蜒于群山之间如碧玉珊瑚枝的高原堰塞湖，湖光山色冠绝藏南。",
    "py": "yangzhuoyongcuo",
    "pi": "yzyc"
  },
  {
    "id": "sp_157",
    "name": "秦始皇兵马俑",
    "fullName": "西安临潼秦始皇兵马俑博物馆",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "610000",
    "city": "610100",
    "unit": "610115",
    "pos": [
      619.4,
      467.8
    ],
    "season": "四季皆宜",
    "blurb": "“世界第八大奇迹”，两千多年前大秦帝国千人千面的地下军阵与铜车马。",
    "py": "qinshihuangbingmayong",
    "pi": "qshbmy"
  },
  {
    "id": "sp_158",
    "name": "华山",
    "fullName": "渭南华阴西岳华山景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区 · 五岳",
    "tier": 1,
    "prov": "610000",
    "city": "610500",
    "unit": "610582",
    "pos": [
      633.9,
      464.9
    ],
    "season": "4–11月",
    "blurb": "“奇险天下第一山”，整块巨型花岗岩浑然天成，长空栈道与鹞子翻身惊险绝伦。",
    "py": "huashan",
    "pi": "hs"
  },
  {
    "id": "sp_159",
    "name": "大雁塔·西安城墙",
    "fullName": "西安大雁塔—大唐芙蓉园与明城墙",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "610000",
    "city": "610100",
    "unit": "610113",
    "pos": [
      613.9,
      471.8
    ],
    "season": "四季皆宜",
    "blurb": "玄奘法师译经藏经之塔与世界保存最完整的古代城垣，再现盛唐长安气象。",
    "py": "dayantaxianchengqiang",
    "pi": "dytxacq"
  },
  {
    "id": "sp_160",
    "name": "延安革命纪念地",
    "fullName": "延安宝塔山与革命纪念地景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "610000",
    "city": "610600",
    "unit": "610602",
    "pos": [
      621,
      417.5
    ],
    "season": "4–11月",
    "blurb": "延河之畔宝塔山下，枣园、杨家岭窑洞镌刻中国革命峥嵘岁月。",
    "py": "yanangemingjiniandi",
    "pi": "yagmjnd"
  },
  {
    "id": "sp_161",
    "name": "黄帝陵",
    "fullName": "延安黄陵桥山黄帝陵景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区 · 华夏第一陵",
    "tier": 2,
    "prov": "610000",
    "city": "610600",
    "unit": "610632",
    "pos": [
      618,
      440.4
    ],
    "season": "四季皆宜",
    "blurb": "中华民族始祖轩辕黄帝陵寝，桥山古柏八万余株，手植柏苍劲挺拔。",
    "py": "huangdiling",
    "pi": "hdl"
  },
  {
    "id": "sp_162",
    "name": "太白山",
    "fullName": "宝鸡眉县秦岭太白山景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "610000",
    "city": "610100",
    "unit": "610124",
    "pos": [
      592.3,
      478.5
    ],
    "season": "5–10月",
    "blurb": "秦岭山脉最高峰（拔仙台海拔 3771.2 米），中国南北自然地理分界线之巅。",
    "py": "taibaishan",
    "pi": "tbs"
  },
  {
    "id": "sp_163",
    "name": "敦煌莫高窟·鸣沙山",
    "fullName": "酒泉敦煌莫高窟与鸣沙山月牙泉",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "620000",
    "city": "620900",
    "unit": "620982",
    "pos": [
      370.9,
      332
    ],
    "season": "5–10月",
    "blurb": "丝绸之路戈壁绿洲上的千年佛教艺术宝库，735 个洞窟壁画彩塑与沙漠月牙泉共生。",
    "py": "dunhuangmogaokumingshashan",
    "pi": "dhmgkmss"
  },
  {
    "id": "sp_164",
    "name": "嘉峪关",
    "fullName": "嘉峪关文物景区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 1,
    "prov": "620000",
    "city": "620200",
    "unit": "620200",
    "pos": [
      427.7,
      342.3
    ],
    "season": "5–10月",
    "blurb": "明代万里长城西端起点，祁连雪山映衬下的“天下第一雄关”锁钥河西走廊。",
    "py": "jiayuguan",
    "pi": "jyg"
  },
  {
    "id": "sp_165",
    "name": "张掖七彩丹霞",
    "fullName": "张掖临泽七彩丹霞旅游景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界地质公园 · 5A",
    "tier": 1,
    "prov": "620000",
    "city": "620700",
    "unit": "620721",
    "pos": [
      457.9,
      363.2
    ],
    "season": "6–10月",
    "blurb": "祁连山北麓色彩最斑斓的彩色丘陵与窗棂状宫殿式丹霞奇观。",
    "py": "zhangyeqicaidanxia",
    "pi": "zyqcdx"
  },
  {
    "id": "sp_166",
    "name": "麦积山石窟",
    "fullName": "天水麦积山风景名胜区",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产 · 5A",
    "tier": 2,
    "prov": "620000",
    "city": "620500",
    "unit": "620503",
    "pos": [
      560.1,
      470.1
    ],
    "season": "4–11月",
    "blurb": "孤峰突起如农家麦垛，凌空栈道串联北魏至宋明泥塑，素有“东方雕塑陈列馆”美誉。",
    "py": "maijishanshiku",
    "pi": "mjssk"
  },
  {
    "id": "sp_167",
    "name": "崆峒山",
    "fullName": "平凉崆峒山风景名胜区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "620000",
    "city": "620800",
    "unit": "620802",
    "pos": [
      569.3,
      442.8
    ],
    "season": "4–10月",
    "blurb": "古丝绸之路西出关中之要塞，传说轩辕黄帝曾在此问道广成子。",
    "py": "kongtongshan",
    "pi": "kts"
  },
  {
    "id": "sp_168",
    "name": "拉卜楞寺·桑科草原",
    "fullName": "甘南夏河拉卜楞寺景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "世界藏学府 · 4A",
    "tier": 2,
    "prov": "620000",
    "city": "623000",
    "unit": "623027",
    "pos": [
      497.4,
      450.4
    ],
    "season": "6–10月",
    "blurb": "大夏河畔藏传佛教格鲁派六大寺院之一，拥有世界最长的转经长廊。",
    "py": "labulengsisangkecaoyuan",
    "pi": "lblsskcy"
  },
  {
    "id": "sp_169",
    "name": "青海湖",
    "fullName": "青海湖景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区 · 中国最大内陆湖",
    "tier": 1,
    "prov": "630000",
    "city": "632500",
    "unit": "632521",
    "pos": [
      457.6,
      410.5
    ],
    "season": "6–8月油菜花季",
    "blurb": "青藏高原东北部面积达四千五百平方公里的浩瀚蓝宝石，盛夏湖畔万亩金黄油菜花盛开。",
    "py": "qinghaihu",
    "pi": "qhh"
  },
  {
    "id": "sp_170",
    "name": "茶卡盐湖·察尔汗",
    "fullName": "海西乌兰茶卡盐湖（天空之镜）",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 4A 景区 · 天空之镜",
    "tier": 1,
    "prov": "630000",
    "city": "632800",
    "unit": "632821",
    "pos": [
      438.2,
      411.7
    ],
    "season": "6–10月",
    "blurb": "柴达木盆地东缘的天然结晶盐湖，湖面平滑如镜，倒映蓝天白云与祁连雪峰。",
    "py": "chakayanhuchaerhan",
    "pi": "ckyhceh"
  },
  {
    "id": "sp_171",
    "name": "塔尔寺",
    "fullName": "西宁湟中塔尔寺景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "630000",
    "city": "630100",
    "unit": "630106",
    "pos": [
      481.5,
      420.5
    ],
    "season": "5–10月",
    "blurb": "藏传佛教格鲁派创始人宗喀巴大师诞生地，酥油花、壁画和堆绣被誉为“塔尔寺艺术三绝”。",
    "py": "taersi",
    "pi": "tes"
  },
  {
    "id": "sp_172",
    "name": "三江源·可可西里",
    "fullName": "三江源国家公园与可可西里",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 国家公园",
    "tier": 1,
    "prov": "630000",
    "city": "632700",
    "unit": "632726",
    "pos": [
      337.4,
      437.9
    ],
    "season": "6–9月",
    "blurb": "长江、黄河、澜沧江发源地“中华水塔”，藏羚羊、野牦牛驰骋的高原荒原秘境。",
    "py": "sanjiangyuankekexili",
    "pi": "sjykkxl"
  },
  {
    "id": "sp_173",
    "name": "互助北山·卓尔山",
    "fullName": "海北祁连阿咪东索（卓尔山）景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "630000",
    "city": "632200",
    "unit": "632222",
    "pos": [
      460.3,
      381
    ],
    "season": "6–9月",
    "blurb": "祁连山脉腹地的丹霞赤壁，与对岸终年积雪的牛心山隔八宝河相望，号称“东方小瑞士”。",
    "py": "huzhubeishanzhuoershan",
    "pi": "hzbszes"
  },
  {
    "id": "sp_174",
    "name": "沙坡头",
    "fullName": "中卫沙坡头旅游景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "640000",
    "city": "640500",
    "unit": "640502",
    "pos": [
      541.9,
      399.5
    ],
    "season": "5–10月",
    "blurb": "腾格里沙漠浩瀚金沙与九曲黄河在此握手，大漠、黄河、高山、绿洲四景同框。",
    "py": "shapotou",
    "pi": "spt"
  },
  {
    "id": "sp_175",
    "name": "西夏陵",
    "fullName": "银川西夏陵国家考古遗址公园",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 4A 景区 · 申遗名录",
    "tier": 1,
    "prov": "640000",
    "city": "640100",
    "unit": "640105",
    "pos": [
      559,
      377.2
    ],
    "season": "4–11月",
    "blurb": "贺兰山麓九座西夏帝王陵墓傲立戈壁，夯土陵台被誉为“东方金字塔”。",
    "py": "xixialing",
    "pi": "xxl"
  },
  {
    "id": "sp_176",
    "name": "镇北堡西部影城",
    "fullName": "银川镇北堡西部影城",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "640000",
    "city": "640100",
    "unit": "640105",
    "pos": [
      560.3,
      372.9
    ],
    "season": "4–10月",
    "blurb": "明清边防古堡遗址改建的电影艺术胜地，《大话西游》《红高粱》等经典影片取景地。",
    "py": "zhenbeibaoxibuyingcheng",
    "pi": "zbbxbyc"
  },
  {
    "id": "sp_177",
    "name": "沙湖",
    "fullName": "石嘴山平罗沙湖生态旅游区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "640000",
    "city": "640200",
    "unit": "640221",
    "pos": [
      564.8,
      368.7
    ],
    "season": "5–10月",
    "blurb": "塞上江南奇观，南沙北湖融江南水乡芦苇候鸟与大漠驼铃于一体。",
    "py": "shahu",
    "pi": "sh"
  },
  {
    "id": "sp_178",
    "name": "喀纳斯·禾木",
    "fullName": "阿勒泰布尔津喀纳斯景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "650000",
    "city": "654300",
    "unit": "654321",
    "pos": [
      276.8,
      121.7
    ],
    "season": "6–10月 · 9月金秋最佳",
    "blurb": "阿尔泰山深处的高山冰碛堰塞湖，神仙湾、月亮湾翡翠碧水与禾木图瓦木屋秋色冠绝北疆。",
    "py": "kanasihemu",
    "pi": "knshm"
  },
  {
    "id": "sp_179",
    "name": "天山天池",
    "fullName": "昌吉阜康天山天池风景名胜区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "650000",
    "city": "652300",
    "unit": "652302",
    "pos": [
      274.4,
      230.9
    ],
    "season": "5–10月",
    "blurb": "博格达峰海拔 5445 米雪山半腰的高山冰碛湖，云杉环抱如瑶池仙境。",
    "py": "tianshantianchi",
    "pi": "tstc"
  },
  {
    "id": "sp_180",
    "name": "那拉提·喀拉峻",
    "fullName": "伊犁那拉提与喀拉峻草原景区",
    "cat": "nature",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 1,
    "prov": "650000",
    "city": "654000",
    "unit": "654025",
    "pos": [
      207.3,
      232.4
    ],
    "season": "5–8月",
    "blurb": "天山腹地伊犁河谷的空中立体草原，雪峰、云杉与百花草甸起伏延展。",
    "py": "nalatikalajun",
    "pi": "nltklj"
  },
  {
    "id": "sp_181",
    "name": "赛里木湖",
    "fullName": "博尔塔拉赛里木湖景区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "650000",
    "city": "652700",
    "unit": "652701",
    "pos": [
      169.7,
      192.9
    ],
    "season": "6–7月花海 · 冬季蓝冰",
    "blurb": "海拔 2071 米的高山冷水湖，被誉为“大西洋最后一滴眼泪”。",
    "py": "sailimuhu",
    "pi": "slmh"
  },
  {
    "id": "sp_182",
    "name": "喀什古城",
    "fullName": "喀什噶尔古城景区",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 1,
    "prov": "650000",
    "city": "653100",
    "unit": "653101",
    "pos": [
      57.4,
      282.4
    ],
    "season": "4–11月",
    "blurb": "帕米尔高原脚下的千年丝路活态迷宫式生土建筑群，充满浓郁西域风情。",
    "py": "kashengucheng",
    "pi": "ksgc"
  },
  {
    "id": "sp_183",
    "name": "火焰山·葡萄沟",
    "fullName": "吐鲁番葡萄沟与火焰山景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "650000",
    "city": "650400",
    "unit": "650402",
    "pos": [
      289,
      254.4
    ],
    "season": "7–9月葡萄季",
    "blurb": "赤红砂岩褶皱山脉热浪翻滚，山谷下坎儿井活水滋养出翠绿清凉的百里葡萄沟。",
    "py": "huoyanshanputaogou",
    "pi": "hysptg"
  },
  {
    "id": "sp_184",
    "name": "巴音布鲁克",
    "fullName": "巴州和静巴音布鲁克景区",
    "cat": "water",
    "worldHeritage": true,
    "badge": "世界自然遗产 · 5A",
    "tier": 2,
    "prov": "650000",
    "city": "652800",
    "unit": "652827",
    "pos": [
      208.1,
      238
    ],
    "season": "6–9月",
    "blurb": "天山南麓广袤高山湿地草原，天鹅湖畔开都河落日映照“九曲十八弯”九个太阳奇景。",
    "py": "bayinbuluke",
    "pi": "byblk"
  },
  {
    "id": "sp_185",
    "name": "帕米尔·慕士冰川",
    "fullName": "喀什塔什库尔干帕米尔旅游区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "国家 5A 景区",
    "tier": 2,
    "prov": "650000",
    "city": "653100",
    "unit": "653131",
    "pos": [
      33.7,
      315.5
    ],
    "season": "5–10月",
    "blurb": "“冰山之父”慕士塔格峰与石头城、盘龙古道共筑帕米尔高原壮歌。",
    "py": "pamiermushibingchuan",
    "pi": "pmemsbc"
  },
  {
    "id": "sp_186",
    "name": "日月潭",
    "fullName": "南投鱼池日月潭风景特定区",
    "cat": "water",
    "worldHeritage": false,
    "badge": "台湾八景之首",
    "tier": 1,
    "prov": "710000",
    "city": "710600",
    "unit": "710600",
    "pos": [
      866.7,
      680.5
    ],
    "season": "四季皆宜",
    "blurb": "玉山山脉北麓的高山天然淡水湖泊，以拉鲁岛为界北形如日轮、南状似月钩。",
    "py": "riyuetan",
    "pi": "ryt"
  },
  {
    "id": "sp_187",
    "name": "阿里山",
    "fullName": "嘉义阿里山国家森林游乐区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "台湾著名高山景区",
    "tier": 1,
    "prov": "710000",
    "city": "711900",
    "unit": "711900",
    "pos": [
      865.7,
      688.6
    ],
    "season": "3–4月樱花 · 四季云海",
    "blurb": "以森林小火车、神木、云海、日出与晚霞“阿里山五奇”享誉海内外。",
    "py": "alishan",
    "pi": "als"
  },
  {
    "id": "sp_188",
    "name": "台北故宫·101",
    "fullName": "台北故宫博物院与台北101",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "文化与都市地标",
    "tier": 1,
    "prov": "710000",
    "city": "710100",
    "unit": "710100",
    "pos": [
      875,
      651.1
    ],
    "season": "四季皆宜",
    "blurb": "珍藏翠玉白菜、毛公鼎与《富春山居图》的中华文物宝库。",
    "py": "taibeigugong",
    "pi": "tbgg"
  },
  {
    "id": "sp_189",
    "name": "太鲁阁",
    "fullName": "花莲太鲁阁峡谷景区",
    "cat": "nature",
    "worldHeritage": false,
    "badge": "大理岩峡谷奇观",
    "tier": 2,
    "prov": "710000",
    "city": "712600",
    "unit": "712600",
    "pos": [
      879.9,
      671.7
    ],
    "season": "四季皆宜",
    "blurb": "立雾溪下切雕琢出的近垂直大理岩断崖峡谷，清水断崖紧邻太平洋蔚蓝海面。",
    "py": "tailuge",
    "pi": "tlg"
  },
  {
    "id": "sp_190",
    "name": "垦丁鹅銮鼻",
    "fullName": "屏东恒春垦丁与鹅銮鼻公园",
    "cat": "water",
    "worldHeritage": false,
    "badge": "台湾最南端海滨",
    "tier": 2,
    "prov": "710000",
    "city": "712400",
    "unit": "712400",
    "pos": [
      872.4,
      723.6
    ],
    "season": "四季如夏",
    "blurb": "巴士海峡与太平洋交界处的珊瑚礁海岸，纯白鹅銮鼻灯塔矗立碧海绿茵间。",
    "py": "kendingeluanbi",
    "pi": "kdelb"
  },
  {
    "id": "sp_191",
    "name": "维多利亚港·太平山",
    "fullName": "香港维多利亚港与太平山顶",
    "cat": "wonder",
    "worldHeritage": false,
    "badge": "世界三大夜景之一",
    "tier": 1,
    "prov": "810000",
    "city": "810000",
    "unit": "810001",
    "pos": [
      732.7,
      732.8
    ],
    "season": "四季皆宜 · 夜景绝佳",
    "blurb": "天星小轮穿梭于维港碧波，太平山凌霄阁俯瞰港岛九龙璀璨摩天森林。",
    "py": "weiduoliyagangtaipingshan",
    "pi": "wdlygtps"
  },
  {
    "id": "sp_192",
    "name": "天坛大佛·大屿山",
    "fullName": "香港大屿山宝莲禅寺与天坛大佛",
    "cat": "heritage",
    "worldHeritage": false,
    "badge": "香港人文地标",
    "tier": 2,
    "prov": "810000",
    "city": "810000",
    "unit": "810018",
    "pos": [
      727.4,
      734
    ],
    "season": "10月–次年4月",
    "blurb": "木鱼峰上高 34 米的青铜露天释迦牟尼坐佛，昂坪缆车跨越碧海青山。",
    "py": "tiantandafodayushan",
    "pi": "ttdfdys"
  },
  {
    "id": "sp_193",
    "name": "大三巴·澳门历史城区",
    "fullName": "澳门历史城区（大三巴牌坊·妈阁庙）",
    "cat": "heritage",
    "worldHeritage": true,
    "badge": "世界文化遗产",
    "tier": 1,
    "prov": "820000",
    "city": "820000",
    "unit": "820005",
    "pos": [
      719.9,
      735.9
    ],
    "season": "四季皆宜",
    "blurb": "四百余年中西宗教与居住建筑糅合共生的历史街区，圣保禄教堂前壁石刻精美绝伦。",
    "py": "dasanbaaomenlishichengqu",
    "pi": "dsbamlscq"
  }
];

export const spotById = new Map(TOURISM_SPOTS.map(s => [s.id, s]));

export const filterSpots = (list, catId = 'all') => {
  if (!catId || catId === 'all') return list;
  if (catId === 'world') return list.filter(s => s.worldHeritage);
  return list.filter(s => s.cat === catId);
};
