import mongoose from 'mongoose'
import Airport from '../models/Airport.mjs'
import 'dotenv/config'

const airports = [
    {
        iata: 'PEK',
        name: '北京首都国际机场',
        city: '北京',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 35,
        latitude: 40.0799,
        longitude: 116.6031,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '机场线',
                stations: ['东直门', '三元桥', '航站楼3号', '航站楼2号'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约8-10分钟一班'
            }],
            bus: [{
                route: '机场大巴1线',
                destination: '西单',
                schedule: '首班05:30 末班21:00',
                price: '¥30'
            }, {
                route: '机场大巴2线',
                destination: '北京站',
                schedule: '首班06:00 末班21:30',
                price: '¥30'
            }],
            taxi: {
                availableAreas: ['北京市区', '廊坊'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['廊坊', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T3航站楼',
            facilities: ['行李寄存', '婴儿室', '祈祷室', '休息室'],
            restaurants: [{
                name: '云品轩',
                location: 'T3C区域',
                cuisine: '中式快餐',
                hours: '06:00-22:00'
            }, {
                name: 'Starbucks',
                location: 'T3E区域',
                cuisine: '咖啡简餐',
                hours: '24小时'
            }],
            shops: [{
                name: '免税店',
                location: 'T3D区域',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['行李寄存', '婴儿室'],
            restaurants: [{
                name: '吉野家',
                location: '二层出发大厅',
                cuisine: '日式快餐',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '诚品书店',
                location: '二层候机区',
                category: '图书文具',
                hours: '08:00-21:00'
            }]
        }],
        hotels: [{
            name: '首都机场希尔顿酒店',
            location: 'T3航站楼附近',
            price: '¥800-1200/晚',
            contact: '010-12345678',
            amenities: ['免费班车', '健身房', '商务中心']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T2值机柜台', 'T3值机柜台'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子客票号',
                    '提前2小时到达机场'
                ]
            },
            security: {
                locations: ['T2安检区', 'T3安检区'],
                requirements: [
                    '液体不超过100ml',
                    '禁止携带打火机等危险品'
                ],
                tips: [
                    '准备好登机牌和证件',
                    '穿着容易脱换的鞋子',
                    '电子设备需单独放置'
                ]
            },
            immigration: {
                location: 'T3E区域',
                requirements: [
                    '护照有效期超过6个月',
                    '确认目的地签证'
                ]
            },
            gates: {
                layout: 'T2: A-E登机口, T3: C-E登机口',
                walkingTimes: new Map([
                    ['T2安检到最远登机口', '约15分钟'],
                    ['T3安检到最远登机口', '约20分钟']
                ])
            }
        }
    },
    {
        iata: 'PVG',
        name: '上海浦东国际机场',
        city: '上海',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 4,
        latitude: 31.1443,
        longitude: 121.8083,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '2号线',
                stations: ['广兰路', '浦东机场'],
                firstTrain: '05:30',
                lastTrain: '22:30',
                frequency: '约8-10分钟一班'
            }, {
                line: '磁浮线',
                stations: ['龙阳路', '浦东机场'],
                firstTrain: '06:00',
                lastTrain: '21:30',
                frequency: '约15-20分钟一班'
            }],
            bus: [{
                route: '机场1线',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥25'
            }],
            taxi: {
                availableAreas: ['上海市区', '嘉定', '松江'],
                approximatePrices: new Map([
                    ['市区', '¥150-200'],
                    ['浦西', '¥200-250']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '新雅粤菜馆',
                location: '三层',
                cuisine: '粤式餐饮',
                hours: '06:30-21:00'
            }],
            shops: [{
                name: '上海特产店',
                location: '二层',
                category: '特产礼品',
                hours: '09:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['休息室', 'VIP室'],
            restaurants: [{
                name: '新石器烤肉',
                location: '四层',
                cuisine: '烤肉',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-23:00'
            }]
        }],
        hotels: [{
            name: '上海浦东机场诺富特酒店',
            location: '浦东机场1号航站楼对面',
            price: '¥700-1000/晚',
            contact: '021-12345678',
            amenities: ['免费班车', '餐厅', '健身房']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1国内值机区', 'T2国际值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前40分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '行程单'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '充电宝需随身携带'
                ],
                tips: [
                    '提前取出电脑和平板',
                    '金属物品需要过X光机'
                ]
            },
            immigration: {
                location: 'T2出发层',
                requirements: [
                    '护照和签证',
                    '出境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: D-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'CAN',
        name: '广州白云国际机场',
        city: '广州',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 15,
        latitude: 23.3959,
        longitude: 113.3079,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '3号线',
                stations: ['体育西路', '机场南'],
                firstTrain: '06:00',
                lastTrain: '23:00',
                frequency: '约7分钟一班'
            }],
            bus: [{
                route: '空港快线',
                destination: '天河客运站',
                schedule: '首班05:30 末班01:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['广州市区', '番禺', '增城'],
                approximatePrices: new Map([
                    ['市区', '¥120-150'],
                    ['番禺', '¥150-180']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '陶陶居',
                location: '出发层',
                cuisine: '粤式点心',
                hours: '07:00-21:00'
            }],
            shops: [{
                name: '广州特产店',
                location: '到达层',
                category: '特产礼品',
                hours: '08:00-22:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['商务中心', 'VIP室'],
            restaurants: [{
                name: '真功夫',
                location: '三层',
                cuisine: '中式快餐',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发区',
                category: '免税商品',
                hours: '08:00-22:00'
            }]
        }],
        hotels: [{
            name: '广州白云机场铂尔曼大酒店',
            location: 'T1航站楼附近',
            price: '¥800-1200/晚',
            contact: '020-12345678',
            amenities: ['免费班车', '游泳池', '健身房']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前120分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票',
                    '提前2小时到达'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带打火机'
                ],
                tips: [
                    '准备好登机牌和证件',
                    '大件行李需托运',
                    '提前脱下外套'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '填写出入境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: E-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'CTU',
        name: '成都双流国际机场',
        city: '成都',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 495,
        latitude: 30.5785,
        longitude: 103.9471,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施'],
            ['nursing', '母婴室']
        ]),
        transportation: {
            subway: [{
                line: '地铁10号线',
                stations: ['双流机场1航站楼', '双流机场2航站楼'],
                firstTrain: '06:00',
                lastTrain: '23:00',
                frequency: '约8分钟一班'
            }],
            bus: [{
                route: '机场专线1号',
                destination: '市区',
                schedule: '06:00-24:00',
                price: '¥15'
            }],
            taxi: {
                availableAreas: ['成都市区', '双流区'],
                approximatePrices: new Map([
                    ['市区', '¥60-100'],
                    ['春熙路', '¥80-120']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '行李寄存'],
            restaurants: [{
                name: '川西坝子',
                location: '三层',
                cuisine: '川菜',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '成都特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-22:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '海底捞火锅',
                location: '四层',
                cuisine: '火锅',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '成都空港假日酒店',
            location: 'T2航站楼附近',
            price: '¥600-900/晚',
            contact: '028-12345678',
            amenities: ['机场班车', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带打火机'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: E-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'SZX',
        name: '深圳宝安国际机场',
        city: '深圳',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 4,
        latitude: 22.6395,
        longitude: 113.8145,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁11号线',
                stations: ['机场北', '机场'],
                firstTrain: '06:30',
                lastTrain: '23:00',
                frequency: '约6分钟一班'
            }],
            bus: [{
                route: '机场快线',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['深圳市区', '宝安区'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['福田', '¥120-170']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '行李寄存'],
            restaurants: [{
                name: '川西坝子',
                location: '三层',
                cuisine: '川菜',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '深圳特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-22:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '海底捞火锅',
                location: '四层',
                cuisine: '火锅',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '深圳空港假日酒店',
            location: 'T2航站楼附近',
            price: '¥600-900/晚',
            contact: '0755-12345678',
            amenities: ['机场班车', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带打火机'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: E-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'KMG',
        name: '昆明长水国际机场',
        city: '昆明',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 2103,
        latitude: 25.1019,
        longitude: 102.9290,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁6号线',
                stations: ['长水国际机场', '昆明南站'],
                firstTrain: '06:00',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场大巴',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥25'
            }],
            taxi: {
                availableAreas: ['昆明市区', '呈贡新区'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['呈贡', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '云南过桥米线',
                location: '三层',
                cuisine: '云南特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '昆明特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['休息室', 'VIP室'],
            restaurants: [{
                name: '云南菜馆',
                location: '四层',
                cuisine: '云南特色餐饮',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-23:00'
            }]
        }],
        hotels: [{
            name: '昆明长水机场希尔顿酒店',
            location: 'T1航站楼附近',
            price: '¥800-1200/晚',
            contact: '0871-12345678',
            amenities: ['免费班车', '健身房', '商务中心']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1国内值机区', 'T2国际值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前40分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '行程单'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '充电宝需随身携带'
                ],
                tips: [
                    '提前取出电脑和平板',
                    '金属物品需要过X光机'
                ]
            },
            immigration: {
                location: 'T2出发层',
                requirements: [
                    '护照和签证',
                    '出境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: D-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'XIY',
        name: '西安咸阳国际机场',
        city: '西安',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 479,
        latitude: 34.4471,
        longitude: 108.7516,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁14号线',
                stations: ['机场西', '机场'],
                firstTrain: '06:00',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场大巴',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['西安市区', '咸阳'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['咸阳', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '西安小吃',
                location: '三层',
                cuisine: '陕西特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '西安特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['休息室', 'VIP室'],
            restaurants: [{
                name: '陕西菜馆',
                location: '四层',
                cuisine: '陕西特色餐饮',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-23:00'
            }]
        }],
        hotels: [{
            name: '西安咸阳机场希尔顿酒店',
            location: 'T1航站楼附近',
            price: '¥800-1200/晚',
            contact: '029-12345678',
            amenities: ['免费班车', '健身房', '商务中心']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1国内值机区', 'T2国际值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前40分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '行程单'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '充电宝需随身携带'
                ],
                tips: [
                    '提前取出电脑和平板',
                    '金属物品需要过X光机'
                ]
            },
            immigration: {
                location: 'T2出发层',
                requirements: [
                    '护照和签证',
                    '出境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: D-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'CKG',
        name: '重庆江北国际机场',
        city: '重庆',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 416,
        latitude: 29.7192,
        longitude: 106.6413,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁10号线',
                stations: ['机场', '江北机场'],
                firstTrain: '06:00',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场大巴',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['重庆市区', '江北区'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['江北', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '重庆小面',
                location: '三层',
                cuisine: '重庆特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '重庆特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['休息室', 'VIP室'],
            restaurants: [{
                name: '重庆火锅',
                location: '四层',
                cuisine: '重庆特色餐饮',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-23:00'
            }]
        }],
        hotels: [{
            name: '重庆江北机场希尔顿酒店',
            location: 'T1航站楼附近',
            price: '¥800-1200/晚',
            contact: '023-12345678',
            amenities: ['免费班车', '健身房', '商务中心']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1国内值机区', 'T2国际值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前40分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '行程单'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '充电宝需随身携带'
                ],
                tips: [
                    '提前取出电脑和平板',
                    '金属物品需要过X光机'
                ]
            },
            immigration: {
                location: 'T2出发层',
                requirements: [
                    '护照和签证',
                    '出境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: D-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'HGH',
        name: '杭州萧山国际机场',
        city: '杭州',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 6,
        latitude: 30.2294,
        longitude: 120.4336,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁7号线',
                stations: ['机场', '杭州东站'],
                firstTrain: '06:00',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场大巴',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['杭州市区', '萧山'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['萧山', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '杭州小吃',
                location: '三层',
                cuisine: '杭州特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '杭州特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['休息室', 'VIP室'],
            restaurants: [{
                name: '杭州菜馆',
                location: '四层',
                cuisine: '杭州特色餐饮',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-23:00'
            }]
        }],
        hotels: [{
            name: '杭州萧山机场希尔顿酒店',
            location: 'T1航站楼附近',
            price: '¥800-1200/晚',
            contact: '0571-12345678',
            amenities: ['免费班车', '健身房', '商务中心']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1国内值机区', 'T2国际值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前40分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '行程单'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '充电宝需随身携带'
                ],
                tips: [
                    '提前取出电脑和平板',
                    '金属物品需要过X光机'
                ]
            },
            immigration: {
                location: 'T2出发层',
                requirements: [
                    '护照和签证',
                    '出境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: D-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'SHA',
        name: '上海虹桥国际机场',
        city: '上海',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 3,
        latitude: 31.1979,
        longitude: 121.3363,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁2号线',
                stations: ['虹桥机场', '上海火车站'],
                firstTrain: '05:30',
                lastTrain: '22:30',
                frequency: '约8-10分钟一班'
            }],
            bus: [{
                route: '机场大巴',
                destination: '市区',
                schedule: '24小时运营',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['上海市区', '长宁区'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['长宁', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '上海小吃',
                location: '三层',
                cuisine: '上海特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '上海特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['休息室', 'VIP室'],
            restaurants: [{
                name: '上海菜馆',
                location: '四层',
                cuisine: '上海特色餐饮',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-23:00'
            }]
        }],
        hotels: [{
            name: '上海虹桥机场希尔顿酒店',
            location: 'T1航站楼附近',
            price: '¥800-1200/晚',
            contact: '021-12345678',
            amenities: ['免费班车', '健身房', '商务中心']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1国内值机区', 'T2国际值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前40分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '行程单'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '充电宝需随身携带'
                ],
                tips: [
                    '提前取出电脑和平板',
                    '金属物品需要过X光机'
                ]
            },
            immigration: {
                location: 'T2出发层',
                requirements: [
                    '护照和签证',
                    '出境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: D-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'NKG',
        name: '南京禄口国际机场',
        city: '南京',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 15,
        latitude: 31.7418,
        longitude: 118.8656,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: 'S1号线',
                stations: ['禄口机场', '翔宇路', '翠屏山'],
                firstTrain: '06:30',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场大巴1线',
                destination: '南京南站',
                schedule: '首班06:00 末班21:30',
                price: '¥25'
            }, {
                route: '机场大巴2线',
                destination: '新街口',
                schedule: '首班06:30 末班21:00',
                price: '¥30'
            }],
            taxi: {
                availableAreas: ['南京市区', '江宁区'],
                approximatePrices: new Map([
                    ['市区', '¥130-180'],
                    ['江宁', '¥80-120']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室', '行李寄存'],
            restaurants: [{
                name: '鸭血粉丝汤',
                location: '三层',
                cuisine: '南京特色餐饮',
                hours: '06:00-21:00'
            }, {
                name: 'KFC',
                location: '二层出发厅',
                cuisine: '快餐',
                hours: '05:30-22:00'
            }],
            shops: [{
                name: '南京特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['VIP贵宾室', '商务中心'],
            restaurants: [{
                name: '盖浇饭',
                location: '四层',
                cuisine: '中式快餐',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '南京空港雅阁酒店',
            location: 'T1航站楼附近',
            price: '¥450-750/晚',
            contact: '025-12345678',
            amenities: ['免费机场接送', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票',
                    '提前2小时到达'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带打火机'
                ],
                tips: [
                    '准备好登机牌和证件',
                    '大件行李需托运',
                    '提前脱下外套'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '填写出入境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: E-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'TAO',
        name: '青岛流亭国际机场',
        city: '青岛',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 10,
        latitude: 36.2661,
        longitude: 120.3742,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁1号线',
                stations: ['流亭机场', '李村公园'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约8分钟一班'
            }],
            bus: [{
                route: '机场快线',
                destination: '市区',
                schedule: '06:00-22:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['青岛市区', '崂山区'],
                approximatePrices: new Map([
                    ['市区', '¥80-120'],
                    ['崂山', '¥60-100']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '行李寄存'],
            restaurants: [{
                name: '海鲜馆',
                location: '一层到达厅',
                cuisine: '山东海鲜',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '青岛啤酒专卖店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '胶东饺子',
                location: '三层',
                cuisine: '山东特色餐饮',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '青岛机场豪华大酒店',
            location: '机场北侧500米',
            price: '¥500-800/晚',
            contact: '0532-12345678',
            amenities: ['免费接机', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带打火机'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约12分钟']
                ])
            }
        }
    },
    {
        iata: 'TSN',
        name: '天津滨海国际机场',
        city: '天津',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 3,
        latitude: 39.1225,
        longitude: 117.3462,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁2号线',
                stations: ['滨海国际机场', '空港经济区'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场巴士1线',
                destination: '天津站',
                schedule: '首班05:30 末班22:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['天津市区', '滨海新区'],
                approximatePrices: new Map([
                    ['市区', '¥120-150'],
                    ['滨海新区', '¥50-80']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '行李寄存'],
            restaurants: [{
                name: '狗不理包子',
                location: '二层出发大厅',
                cuisine: '天津特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '杨柳青年画店',
                location: '一层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '煎饼馃子',
                location: '四层',
                cuisine: '天津特色早餐',
                hours: '05:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '天津滨海机场东海酒店',
            location: 'T2航站楼附近',
            price: '¥550-850/晚',
            contact: '022-12345678',
            amenities: ['免费班车', '健身房', '会议室']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带打火机'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'CSX',
        name: '长沙黄花国际机场',
        city: '长沙',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 63,
        latitude: 28.1892,
        longitude: 113.2184,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁磁浮线',
                stations: ['黄花机场', '磁浮高铁站'],
                firstTrain: '06:30',
                lastTrain: '22:30',
                frequency: '约15分钟一班'
            }],
            bus: [{
                route: '机场大巴1线',
                destination: '长沙火车站',
                schedule: '06:00-22:00',
                price: '¥25'
            }],
            taxi: {
                availableAreas: ['长沙市区', '开福区'],
                approximatePrices: new Map([
                    ['市区', '¥90-120'],
                    ['岳麓区', '¥100-140']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '茶颜悦色',
                location: '二层出发厅',
                cuisine: '奶茶饮品',
                hours: '07:00-22:00'
            }],
            shops: [{
                name: '湖南特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['VIP室', '商务中心'],
            restaurants: [{
                name: '臭豆腐店',
                location: '三层',
                cuisine: '湖南特色小吃',
                hours: '10:00-21:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '长沙黄花机场国际酒店',
            location: '机场东侧800米',
            price: '¥480-750/晚',
            contact: '0731-12345678',
            amenities: ['免费机场接送', '餐厅', '会议室']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约12分钟']
                ])
            }
        }
    },
    {
        iata: 'XMN',
        name: '厦门高崎国际机场',
        city: '厦门',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 16,
        latitude: 24.5440,
        longitude: 118.1274,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁1号线',
                stations: ['机场', '殿前'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约8分钟一班'
            }],
            bus: [{
                route: '空港快线',
                destination: '厦门火车站',
                schedule: '06:00-22:00',
                price: '¥15'
            }],
            taxi: {
                availableAreas: ['厦门岛内', '集美区'],
                approximatePrices: new Map([
                    ['思明区', '¥50-80'],
                    ['湖里区', '¥30-50']
                ])
            }
        },
        terminals: [{
            name: 'T3航站楼',
            facilities: ['休息室', '母婴室'],
            restaurants: [{
                name: '沙茶面',
                location: '三层',
                cuisine: '闽南特色餐饮',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '鼓浪屿特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T4航站楼',
            facilities: ['贵宾休息室', '商务中心'],
            restaurants: [{
                name: '土笋冻',
                location: '四层',
                cuisine: '厦门特色小吃',
                hours: '10:00-21:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '厦门机场宝龙铂尔曼大酒店',
            location: '机场西侧1公里',
            price: '¥700-1100/晚',
            contact: '0592-12345678',
            amenities: ['免费机场班车', '健身房', '游泳池']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T3值机区', 'T4值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T3安检区', 'T4安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T4国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T3: A-C登机口, T4: D-F登机口',
                walkingTimes: new Map([
                    ['T3安检到最远登机口', '约8分钟'],
                    ['T4安检到最远登机口', '约12分钟']
                ])
            }
        }
    },
    {
        iata: 'CGO',
        name: '郑州新郑国际机场',
        city: '郑州',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 151,
        latitude: 34.5197,
        longitude: 113.8408,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '城际铁路',
                stations: ['新郑机场', '郑州南站'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约30分钟一班'
            }],
            bus: [{
                route: '机场巴士',
                destination: '郑州市区',
                schedule: '06:00-22:00',
                price: '¥25'
            }],
            taxi: {
                availableAreas: ['郑州市区', '新郑市'],
                approximatePrices: new Map([
                    ['市区', '¥100-150'],
                    ['新郑', '¥50-80']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '胡辣汤',
                location: '二层',
                cuisine: '河南特色早餐',
                hours: '05:00-22:00'
            }],
            shops: [{
                name: '河南特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '烩面馆',
                location: '三层',
                cuisine: '河南特色面食',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '郑州新郑机场福朋喜来登酒店',
            location: '机场东侧2公里',
            price: '¥650-980/晚',
            contact: '0371-12345678',
            amenities: ['免费机场接送', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'DLC',
        name: '大连周水子国际机场',
        city: '大连',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 33,
        latitude: 38.9656,
        longitude: 121.5386,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁2号线',
                stations: ['周水子机场', '华南广场'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约8分钟一班'
            }],
            bus: [{
                route: '机场巴士',
                destination: '大连火车站',
                schedule: '06:00-21:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['大连市区', '开发区'],
                approximatePrices: new Map([
                    ['市区', '¥60-100'],
                    ['开发区', '¥100-150']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '大连海鲜',
                location: '二层',
                cuisine: '海鲜',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '大连特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '水饺店',
                location: '三层',
                cuisine: '东北饺子',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '大连机场希尔顿欢朋酒店',
            location: '机场北侧1.5公里',
            price: '¥500-800/晚',
            contact: '0411-12345678',
            amenities: ['免费机场接送', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约12分钟']
                ])
            }
        }
    },
    {
        iata: 'WUH',
        name: '武汉天河国际机场',
        city: '武汉',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 34,
        latitude: 30.7838,
        longitude: 114.2081,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁2号线',
                stations: ['天河机场', '航空总部'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约8分钟一班'
            }],
            bus: [{
                route: '机场巴士',
                destination: '武汉火车站',
                schedule: '06:00-22:00',
                price: '¥30'
            }],
            taxi: {
                availableAreas: ['武汉市区', '汉阳区'],
                approximatePrices: new Map([
                    ['市区', '¥120-160'],
                    ['光谷', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T2航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '热干面',
                location: '二层',
                cuisine: '武汉特色小吃',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '楚天特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T3航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '周黑鸭',
                location: '三层',
                cuisine: '武汉特色小吃',
                hours: '10:00-22:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:00'
            }]
        }],
        hotels: [{
            name: '武汉天河机场东途格精选酒店',
            location: '机场南侧1公里',
            price: '¥450-750/晚',
            contact: '027-12345678',
            amenities: ['免费机场接送', '餐厅', '健身房']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T2值机区', 'T3值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T2安检区', 'T3安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T3国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T2: A-D登机口, T3: E-G登机口',
                walkingTimes: new Map([
                    ['T2安检到最远登机口', '约10分钟'],
                    ['T3安检到最远登机口', '约15分钟']
                ])
            }
        }
    },
    {
        iata: 'SYX',
        name: '三亚凤凰国际机场',
        city: '三亚',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 23,
        latitude: 18.3029,
        longitude: 109.4124,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['nursing', '母婴室']
        ]),
        transportation: {
            subway: [],
            bus: [{
                route: '机场专线1号',
                destination: '三亚湾',
                schedule: '07:00-24:00',
                price: '¥15'
            }, {
                route: '机场专线2号',
                destination: '大东海',
                schedule: '07:00-23:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['三亚市区', '海棠湾'],
                approximatePrices: new Map([
                    ['市区', '¥50-80'],
                    ['亚龙湾', '¥120-150']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '海南椰子鸡',
                location: '二层',
                cuisine: '海南特色餐饮',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '海南特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }],
        hotels: [{
            name: '三亚凤凰机场海航首意酒店',
            location: '机场东北侧800米',
            price: '¥600-1200/晚',
            contact: '0898-12345678',
            amenities: ['免费接送机', '游泳池', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T1国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约8分钟']
                ])
            }
        }
    },
    {
        iata: 'HET',
        name: '呼和浩特白塔国际机场',
        city: '呼和浩特',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 1065,
        latitude: 40.8512,
        longitude: 111.8222,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['disabled', '无障碍设施']
        ]),
        transportation: {
            subway: [],
            bus: [{
                route: '机场1线',
                destination: '呼和浩特火车站',
                schedule: '07:00-21:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['呼和浩特市区', '赛罕区'],
                approximatePrices: new Map([
                    ['市区', '¥60-100'],
                    ['新城区', '¥80-120']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '蒙古包肉',
                location: '二层出发大厅',
                cuisine: '蒙古特色餐饮',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '内蒙特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '奶茶馆',
                location: '三层',
                cuisine: '蒙古奶茶',
                hours: '10:00-21:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-21:00'
            }]
        }],
        hotels: [{
            name: '呼和浩特机场盛捷服务公寓',
            location: '机场西侧2公里',
            price: '¥400-700/晚',
            contact: '0471-12345678',
            amenities: ['免费接机', '健身房', '餐厅']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约8分钟'],
                    ['T2安检到最远登机口', '约10分钟']
                ])
            }
        }
    },
    {
        iata: 'KWE',
        name: '贵阳龙洞堡国际机场',
        city: '贵阳',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 1073,
        latitude: 26.5385,
        longitude: 106.8016,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心']
        ]),
        transportation: {
            subway: [{
                line: '地铁2号线',
                stations: ['龙洞堡机场', '白云区'],
                firstTrain: '06:30',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场1线',
                destination: '贵阳火车站',
                schedule: '07:00-21:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['贵阳市区', '白云区'],
                approximatePrices: new Map([
                    ['市区', '¥70-100'],
                    ['花溪区', '¥100-130']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '丝娃娃',
                location: '二层',
                cuisine: '贵州特色小吃',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '贵州特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '酸汤鱼',
                location: '三层',
                cuisine: '贵州特色餐饮',
                hours: '10:00-21:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-21:00'
            }]
        }],
        hotels: [{
            name: '贵阳龙洞堡机场希尔顿花园酒店',
            location: '机场南侧1公里',
            price: '¥600-900/晚',
            contact: '0851-12345678',
            amenities: ['免费机场接送', '健身房', '会议室']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约12分钟']
                ])
            }
        }
    },
    {
        iata: 'HRB',
        name: '哈尔滨太平国际机场',
        city: '哈尔滨',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 143,
        latitude: 45.6234,
        longitude: 126.2501,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['heating', '取暖设施']
        ]),
        transportation: {
            subway: [{
                line: '地铁3号线',
                stations: ['太平机场', '哈东客运站'],
                firstTrain: '06:00',
                lastTrain: '22:00',
                frequency: '约10分钟一班'
            }],
            bus: [{
                route: '机场巴士1号',
                destination: '哈尔滨火车站',
                schedule: '06:00-21:00',
                price: '¥20'
            }],
            taxi: {
                availableAreas: ['哈尔滨市区', '道里区'],
                approximatePrices: new Map([
                    ['市区', '¥80-120'],
                    ['松北区', '¥150-200']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['休息室', '婴儿室'],
            restaurants: [{
                name: '红肠',
                location: '二层',
                cuisine: '东北特色小吃',
                hours: '06:00-21:00'
            }],
            shops: [{
                name: '黑龙江特产店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['贵宾室', '商务中心'],
            restaurants: [{
                name: '东北菜馆',
                location: '三层',
                cuisine: '东北菜',
                hours: '10:00-21:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-21:00'
            }]
        }],
        hotels: [{
            name: '哈尔滨太平机场开元名都大酒店',
            location: '机场西侧1.5公里',
            price: '¥550-850/晚',
            contact: '0451-12345678',
            amenities: ['免费机场接送', '暖气', '室内游泳池']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备',
                    '冬季大衣需单独过检'
                ]
            },
            immigration: {
                location: 'T2国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料'
                ]
            },
            gates: {
                layout: 'T1: A-C登机口, T2: D-F登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约10分钟'],
                    ['T2安检到最远登机口', '约12分钟']
                ])
            }
        }
    },
    {
        iata: 'TAO2',
        name: '青岛胶东国际机场',
        city: '青岛',
        country: '中国',
        timezone: 'UTC+8',
        elevation: 20,
        latitude: 36.3612,
        longitude: 120.0865,
        facilities: new Map([
            ['wifi', '免费WiFi'],
            ['luggage', '行李车租赁'],
            ['medical', '医疗中心'],
            ['disabled', '无障碍设施'],
            ['vip', '贵宾服务']
        ]),
        transportation: {
            subway: [{
                line: '地铁8号线',
                stations: ['胶东机场', '胶东机场综合交通换乘中心'],
                firstTrain: '06:00',
                lastTrain: '22:30',
                frequency: '约7分钟一班'
            }],
            bus: [{
                route: '机场快线1号',
                destination: '青岛火车站',
                schedule: '06:00-22:00',
                price: '¥30'
            }, {
                route: '机场快线2号',
                destination: '崂山区',
                schedule: '07:00-21:00',
                price: '¥25'
            }],
            taxi: {
                availableAreas: ['青岛市区', '黄岛区', '即墨区'],
                approximatePrices: new Map([
                    ['市区', '¥150-200'],
                    ['黄岛', '¥100-130'],
                    ['即墨区', '¥60-80']
                ])
            }
        },
        terminals: [{
            name: 'T1航站楼',
            facilities: ['贵宾休息室', '母婴室', '行李寄存', '祈祷室'],
            restaurants: [{
                name: '海鲜馆',
                location: '三层出发厅',
                cuisine: '胶东海鲜',
                hours: '06:00-22:00'
            }, {
                name: '星巴克',
                location: '二层出发厅',
                cuisine: '咖啡简餐',
                hours: '06:00-22:00'
            }],
            shops: [{
                name: '青岛啤酒专卖店',
                location: '二层',
                category: '特产礼品',
                hours: '08:00-21:00'
            }, {
                name: '海洋贝壳纪念品',
                location: '三层',
                category: '特色工艺品',
                hours: '09:00-21:00'
            }]
        }, {
            name: 'T2航站楼',
            facilities: ['VIP贵宾室', '商务中心', '淋浴设施'],
            restaurants: [{
                name: '崂山面馆',
                location: '四层',
                cuisine: '山东特色面食',
                hours: '10:00-22:00'
            }, {
                name: '胶东风味餐厅',
                location: '三层',
                cuisine: '胶东特色菜',
                hours: '07:00-21:00'
            }],
            shops: [{
                name: '免税店',
                location: '出发层',
                category: '免税商品',
                hours: '07:00-22:30'
            }, {
                name: '即墨老酒专卖',
                location: '二层',
                category: '酒类特产',
                hours: '08:00-22:00'
            }]
        }],
        hotels: [{
            name: '青岛胶东机场希尔顿酒店',
            location: '机场西侧800米',
            price: '¥800-1200/晚',
            contact: '0532-88889999',
            amenities: ['免费机场接送', '健身房', '室内游泳池', '商务中心']
        }, {
            name: '胶东机场东方航空酒店',
            location: '机场东侧1公里',
            price: '¥500-800/晚',
            contact: '0532-77778888',
            amenities: ['免费班车', '餐厅', '会议室']
        }],
        boardingProcess: {
            checkIn: {
                locations: ['T1值机区', 'T2值机区'],
                deadlines: new Map([
                    ['国内航班', '起飞前45分钟'],
                    ['国际航班', '起飞前90分钟']
                ]),
                requirements: [
                    '有效身份证件',
                    '电子机票',
                    '健康码/核酸检测（如需）'
                ]
            },
            security: {
                locations: ['T1安检区', 'T2安检区'],
                requirements: [
                    '液体限制100ml以内',
                    '禁止携带危险品',
                    '大型电子设备需单独检查'
                ],
                tips: [
                    '提前准备证件',
                    '取出电子设备',
                    '脱掉外套和金属物品'
                ]
            },
            immigration: {
                location: 'T1国际区',
                requirements: [
                    '护照有效期充足',
                    '签证材料',
                    '出入境卡'
                ]
            },
            gates: {
                layout: 'T1: A-D登机口, T2: E-H登机口',
                walkingTimes: new Map([
                    ['T1安检到最远登机口', '约12分钟'],
                    ['T2安检到最远登机口', '约15分钟']
                ])
            }
        }
    }
]

async function initAirports() {
    try {
        await mongoose.connect('mongodb://localhost:27017/flight-log')
        console.log('Connected to MongoDB')

        // 清空现有数据
        await Airport.deleteMany({})
        console.log('Cleared existing airports')

        // 插入新数据
        await Airport.insertMany(airports)
        console.log('Inserted airport data')

        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
    } catch (error) {
        console.error('初始化机场数据失败:', error)
        process.exit(1)
    }
}

initAirports() 