// 三年级段课程体系数据

export type CourseActivity = {
    icon: string
    title: string
    type: 'story' | 'knowledge' | 'gem' | 'experiment' | 'try-it'
    typeLabel: string
    desc: string
    done?: boolean
}

export type CourseDay = {
    day: string
    island: string
    activities: CourseActivity[]
    unlockText: string
}

export type CourseChapter = {
    num: number
    title: string
    badge: string
    badgeIcon: string
    summary: string
    tryIt: string
    activities: CourseActivity[]
}

export type CourseData = {
    id: string
    gradeLabel: string
    courseName: string
    subtitle: string
    motto: string
    days?: CourseDay[]
    chapters?: CourseChapter[]
    treasureBlurb: string
    gems: { icon: string; name: string; island: string; desc: string }[]
    safetyTips: { icon: string; title: string; text: string }[]
}

// 1~3年级：启明星大冒险
const elementaryLow: CourseData = {
    id: 'qmx',
    gradeLabel: '一~三年级',
    courseName: '启明星大冒险',
    subtitle: '认识 AI：会看、会听、会学',
    motto: '8 集漫画 · 8 颗宝石',
    days: [
        {
            day: '第一天', island: '启明星岛',
            activities: [
                { icon: '🌟', title: '启明星变暗了', type: 'story', typeLabel: '听故事', desc: '信息城堡失去了光明，集齐8颗AI宝石才能恢复', done: true },
                { icon: '🤖', title: 'AI 是什么呀？', type: 'knowledge', typeLabel: '学知识', desc: '不是天上的星星，是会看、会听、会帮忙的聪明工具', done: true },
                { icon: '💎', title: '收集好奇宝石', type: 'gem', typeLabel: '集宝石', desc: '敢提问、爱探索，和小贝的AI探险队集合出发！', done: true },
            ],
            unlockText: '嘀嘀！AI 探险队集合，出发点亮启明星！',
        },
        {
            day: '第二天', island: '家居岛',
            activities: [
                { icon: '🏠', title: '哇，这里好像我家呀', type: 'story', typeLabel: '听故事', desc: '小音箱、门锁、扫地机器人，大家都在忙什么？' },
                { icon: '🎵', title: '家里的 AI 帮手', type: 'knowledge', typeLabel: '学知识', desc: '音箱听懂儿歌，门锁认出小脸，机器人会看哪里脏' },
                { icon: '💎', title: '收集发现宝石', type: 'gem', typeLabel: '集宝石', desc: '细心找一找：会听、会看、会帮忙的AI就在身边' },
            ],
            unlockText: '完成以上内容后解锁下一座岛',
        },
        {
            day: '第三天', island: '眼睛岛',
            activities: [
                { icon: '🐱', title: '这是猫还是狗呀？', type: 'story', typeLabel: '听故事', desc: 'AI眼睛学校有好多照片，连小蓝都一时分不出来' },
                { icon: '👀', title: 'AI 怎么认出小猫', type: 'knowledge', typeLabel: '学知识', desc: '先看很多很多猫的照片，记住尖耳朵、长胡须' },
                { icon: '💎', title: '收集眼睛宝石', type: 'gem', typeLabel: '集宝石', desc: 'AI的眼睛靠多看例子，才慢慢学会认东西' },
            ],
            unlockText: '完成以上内容后解锁下一座岛',
        },
        {
            day: '第四天', island: '耳朵岛',
            activities: [
                { icon: '👂', title: '咦，我听错啦！', type: 'story', typeLabel: '听故事', desc: '小多把"开灯"听岔了，花朵一样的耳朵岛真好玩' },
                { icon: '💬', title: '让 AI 听清你说话', type: 'knowledge', typeLabel: '学知识', desc: '一个字一个字慢慢说、大声说：开——灯！' },
                { icon: '💎', title: '收集耳朵宝石', type: 'gem', typeLabel: '集宝石', desc: '把口令说清楚，AI的耳朵才能听得懂' },
            ],
            unlockText: '完成以上内容后解锁下一座岛',
        },
        {
            day: '第五天', island: '智慧岛',
            activities: [
                { icon: '🍎', title: '哇，好多水果呀', type: 'story', typeLabel: '听故事', desc: '哪个是苹果，哪个是香蕉？小多也有点分不清' },
                { icon: '🧠', title: 'AI 学习的秘密', type: 'knowledge', typeLabel: '学知识', desc: '看很多苹果的样子：圆圆的、红红的、有个小柄' },
                { icon: '💎', title: '收集智慧宝石', type: 'gem', typeLabel: '集宝石', desc: '多看多学，例子看得越多，新本领学得越牢' },
            ],
            unlockText: '完成以上内容后解锁下一座岛',
        },
        {
            day: '第六天', island: '时光岛',
            activities: [
                { icon: '🚀', title: '坐上时光机出发', type: 'story', typeLabel: '听故事', desc: '去很久很久以前，看看AI刚出生时的样子' },
                { icon: '⏳', title: 'AI 成长记', type: 'knowledge', typeLabel: '学知识', desc: '小小零件 → 装上身体学会走路 → 厉害的大帮手' },
                { icon: '💎', title: '收集时光宝石', type: 'gem', typeLabel: '集宝石', desc: '大家都是慢慢长大的，每一点进步都很珍贵' },
            ],
            unlockText: '完成以上内容后解锁下一座岛',
        },
        {
            day: '第七天', island: '迷雾岛',
            activities: [
                { icon: '🦋', title: '雾中的"小鸟"', type: 'story', typeLabel: '听故事', desc: '雾太大啦，小多把蝴蝶错看成了一只小鸟' },
                { icon: '🔍', title: 'AI 也会犯错哦', type: 'knowledge', typeLabel: '学知识', desc: '当小侦探：仔细看一看、想一想，再下结论' },
                { icon: '💎', title: '收集思考宝石', type: 'gem', typeLabel: '集宝石', desc: '多检查、多思考，就不会被大雾骗啦' },
            ],
            unlockText: '完成以上内容后解锁下一座岛',
        },
        {
            day: '第八天', island: '城堡岛',
            activities: [
                { icon: '🏰', title: '城堡门口的陌生人', type: 'story', typeLabel: '听故事', desc: '黑影打听住址、生日和爸爸妈妈的电话号码' },
                { icon: '🤫', title: '我的秘密不乱说', type: 'knowledge', typeLabel: '学知识', desc: '住址、生日、爸妈电话，都是不能乱说的小秘密' },
                { icon: '💎', title: '收集守护宝石', type: 'gem', typeLabel: '集宝石', desc: '勇敢赶跑黑影，8颗宝石集齐，启明星亮啦！' },
            ],
            unlockText: '完成以上内容后解锁个性化选学',
        },
    ],
    treasureBlurb: '八颗宝石知识宝库',
    gems: [
        { icon: '❓', name: '好奇宝石', island: '启明星岛', desc: 'AI 是会看、会听、会帮忙的聪明工具' },
        { icon: '🔎', name: '发现宝石', island: '家居岛', desc: '音箱、门锁、扫地机器人，AI 就在身边' },
        { icon: '👀', name: '眼睛宝石', island: '眼睛岛', desc: 'AI 靠看很多例子，才学会认东西' },
        { icon: '👂', name: '耳朵宝石', island: '耳朵岛', desc: '说清楚、说大声，AI 才能听懂' },
        { icon: '🧠', name: '智慧宝石', island: '智慧岛', desc: '多看多学，例子越多认得越准' },
        { icon: '⏳', name: '时光宝石', island: '时光岛', desc: 'AI 是一步步长大的，进步很珍贵' },
        { icon: '🧐', name: '思考宝石', island: '迷雾岛', desc: 'AI 也会犯错，要多检查多思考' },
        { icon: '🛡️', name: '守护宝石', island: '城堡岛', desc: '护好小秘密，就是最好的守护' },
    ],
    safetyTips: [
        { icon: '🔒', title: '我的小秘密', text: '家庭住址、生日、爸爸妈妈的电话，不可以随便告诉别人！' },
        { icon: '🤖', title: 'AI 是好帮手', text: '遇到不对的事，动脑想一想、动手查一查，不要随便相信哦！' },
    ],
}

// 4~6年级：AI创想大陆
const elementaryHigh: CourseData = {
    id: 'cxd',
    gradeLabel: '四~六年级',
    courseName: 'AI 创想大陆',
    subtitle: '使用 AI：会用 · 会创 · 会改 · 会查',
    motto: '6 章读本 · 6 枚创想徽章',
    chapters: [
        {
            num: 1, title: 'AI 超能力图鉴', badge: '全景徽章', badgeIcon: '🔭',
            summary: 'AI 会写、会画、会听、会看、会推荐；但也有四条边界——幻觉、知识截止、无真实经历、无道德判断。',
            tryIt: '给 AI 出三道难题，记录它的回答和自信度，验证"猜而非回忆"',
            activities: [
                { icon: '🔭', title: 'AI 能做什么', type: 'knowledge', typeLabel: '学知识', desc: '写作、绘画、语音、视觉、推荐——AI的超能力全景图', done: true },
                { icon: '⚠️', title: 'AI 的四条边界', type: 'knowledge', typeLabel: '学知识', desc: '会编造事实、知识有截止日期、没有真实经历、不能代替道德判断', done: true },
                { icon: '🏅', title: '获得全景徽章', type: 'gem', typeLabel: '集徽章', desc: '认识AI的超能力和边界', done: true },
            ],
        },
        {
            num: 2, title: '把话说清楚', badge: '沟通徽章', badgeIcon: '💬',
            summary: '怎样表达 AI 才听得懂——目标、对象、场合、格式、限制五要素；结果不满意时如何追问和修改。',
            tryIt: '你画我猜 AI 版：通过限制轮次与补充描述体验"明确需求→生成→反馈"',
            activities: [
                { icon: '💬', title: '五要素说清楚', type: 'knowledge', typeLabel: '学知识', desc: '目标、对象、场合、格式、限制——让AI听懂你的话' },
                { icon: '🔄', title: '不满意怎么办', type: 'knowledge', typeLabel: '学知识', desc: '追问、修改、补充——和AI对话是个来回的过程' },
                { icon: '🏅', title: '获得沟通徽章', type: 'gem', typeLabel: '集徽章', desc: '学会让AI听懂你的需求' },
            ],
        },
        {
            num: 3, title: '创意放大器', badge: '创意徽章', badgeIcon: '🎨',
            summary: 'AI 是乐器，你是作曲家——先手写构思，再用 AI 生成，然后修改定稿。创作四步法：构思→生成→修改→定稿。',
            tryIt: '做一本属于自己的绘本，严格按四步执行，并标注 AI 参与部分',
            activities: [
                { icon: '✏️', title: '先构思再生成', type: 'knowledge', typeLabel: '学知识', desc: '手写手绘构思在前，AI生成在后' },
                { icon: '🎨', title: '创作四步法', type: 'knowledge', typeLabel: '学知识', desc: '构思→生成→修改→定稿' },
                { icon: '🏷️', title: '如实标注', type: 'knowledge', typeLabel: '学知识', desc: 'AI参与创作的部分要诚实标注' },
                { icon: '🏅', title: '获得创意徽章', type: 'gem', typeLabel: '集徽章', desc: '学会用四步法创作作品' },
            ],
        },
        {
            num: 4, title: '真相侦探社', badge: '侦探徽章', badgeIcon: '🔍',
            summary: 'AI 会一本正经地胡说八道（幻觉）——追求"像"而非"真"。核验三步法：找源头、交叉查、问常识。',
            tryIt: '侦探委托案：对三条 AI 答案逐条查证，撰写《侦探查证报告》',
            activities: [
                { icon: '🕵️', title: 'AI 会编造事实', type: 'knowledge', typeLabel: '学知识', desc: '幻觉——AI追求"像"而非"真"，不能直接采信' },
                { icon: '🔍', title: '核验三步法', type: 'knowledge', typeLabel: '学知识', desc: '找源头、交叉查、问常识——查过了才算' },
                { icon: '🏅', title: '获得侦探徽章', type: 'gem', typeLabel: '集徽章', desc: '学会核验AI给出的信息' },
            ],
        },
        {
            num: 5, title: '教 AI 认世界', badge: '训练师徽章', badgeIcon: '🧪',
            summary: 'AI 学认东西和小孩学认猫类似——通过大量例子训练。四步流程：收集样本→打标签→训练→测试。',
            tryIt: '写一份训练日志：小组完成分类训练实验，记录样本、标签、测试和准确率',
            activities: [
                { icon: '📦', title: '收集样本与打标签', type: 'knowledge', typeLabel: '学知识', desc: '喂AI什么，它就成为什么——数据决定能力' },
                { icon: '🧪', title: '训练与测试', type: 'knowledge', typeLabel: '学知识', desc: '用准确率数字评估效果，找出弱点改进' },
                { icon: '🏅', title: '获得训练师徽章', type: 'gem', typeLabel: '集徽章', desc: '学会教AI认识新东西' },
            ],
        },
        {
            num: 6, title: '负责任的创想家', badge: '责任徽章', badgeIcon: '🛡️',
            summary: '数字安全三条红线：不传人脸照片、不输入真实姓名、不透露学校住址。综合项目"身边问题解决者"。',
            tryIt: '创想发布会：从真实问题选题，规划、创作、发布，以"问题真、构思清、查证实、复盘诚"评审',
            activities: [
                { icon: '🚫', title: '三条安全红线', type: 'knowledge', typeLabel: '学知识', desc: '不传人脸、不输真名、不透露住址' },
                { icon: '🛠️', title: '身边问题解决者', type: 'try-it', typeLabel: '动手做', desc: '综合项目：发现真实问题，用AI帮忙解决' },
                { icon: '🏅', title: '获得责任徽章', type: 'gem', typeLabel: '集徽章', desc: '成为负责任的AI创想家' },
            ],
        },
    ],
    treasureBlurb: '六枚创想徽章宝库',
    gems: [
        { icon: '🔭', name: '全景徽章', island: 'AI超能力图鉴', desc: '认识AI的超能力与四条边界' },
        { icon: '💬', name: '沟通徽章', island: '把话说清楚', desc: '五要素让AI听懂你的话' },
        { icon: '🎨', name: '创意徽章', island: '创意放大器', desc: '四步法创作你的作品' },
        { icon: '🔍', name: '侦探徽章', island: '真相侦探社', desc: '核验三步法查证信息' },
        { icon: '🧪', name: '训练师徽章', island: '教AI认世界', desc: '收集样本、训练与测试' },
        { icon: '🛡️', name: '责任徽章', island: '负责任的创想家', desc: '三条安全红线与综合项目' },
    ],
    safetyTips: [
        { icon: '🔒', title: '三条安全红线', text: '不传人脸照片、不输入真实姓名、不透露学校/班级/家庭住址' },
        { icon: '✅', title: '如实标注', text: 'AI 参与创作的部分要诚实标注；使用他人作品前先获得允许' },
    ],
}

// 7~9年级：AI原理实验室
const secondary: CourseData = {
    id: 'lab',
    gradeLabel: '七~九年级',
    courseName: 'AI 原理实验室',
    subtitle: '理解与设计 AI：懂数据 · 懂模型 · 会实验 · 会设计',
    motto: '9 章实验手册 · 1 个真实项目',
    chapters: [
        {
            num: 1, title: 'AI 系统解剖室', badge: '解剖徽章', badgeIcon: '🔧',
            summary: '说出AI系统五部件（数据、模型、算力、算法、应用），区分AI、普通程序、自动化设备和机器人。',
            tryIt: '拆解一个真实AI应用，标注五部件各自的角色',
            activities: [
                { icon: '🔧', title: 'AI系统的五部件', type: 'knowledge', typeLabel: '学原理', desc: '数据、模型、算力、算法、应用——AI由什么组成', done: true },
                { icon: '🤔', title: 'AI vs 普通程序', type: 'knowledge', typeLabel: '学原理', desc: '学会区分AI、普通程序、自动化设备和机器人', done: true },
                { icon: '🏅', title: '获得解剖徽章', type: 'gem', typeLabel: '集徽章', desc: '拆开AI看内部结构', done: true },
            ],
        },
        {
            num: 2, title: '数据侦探营', badge: '数据徽章', badgeIcon: '📊',
            summary: '数据的五站旅程：采集→清洗→标注→训练集/测试集分离→找坏样本。动手标注，理解数据质量为何影响模型。',
            tryIt: '动手标注一批样本，找出并修正数据中的"坏样本"',
            activities: [
                { icon: '📊', title: '数据五站旅程', type: 'knowledge', typeLabel: '学原理', desc: '采集→清洗→标注→分割→质检' },
                { icon: '🏷️', title: '训练集与测试集', type: 'knowledge', typeLabel: '学原理', desc: '为什么要分开训练和测试数据' },
                { icon: '🏅', title: '获得数据徽章', type: 'gem', typeLabel: '集徽章', desc: '理解数据质量决定模型能力' },
            ],
        },
        {
            num: 3, title: '算法的工具箱', badge: '算法徽章', badgeIcon: '🧮',
            summary: '分类、回归、聚类、推荐——四类机器学习任务及与规则程序的区别。理解"算法"不是魔法而是工具。',
            tryIt: '给生活中的问题选择合适的算法类型并说明理由',
            activities: [
                { icon: '🧮', title: '四类学习任务', type: 'knowledge', typeLabel: '学原理', desc: '分类、回归、聚类、推荐——不同问题用不同算法' },
                { icon: '⚖️', title: '算法 vs 规则', type: 'knowledge', typeLabel: '学原理', desc: '为什么AI不从规则出发而从数据出发' },
                { icon: '🏅', title: '获得算法徽章', type: 'gem', typeLabel: '集徽章', desc: '理解算法是工具不是魔法' },
            ],
        },
        {
            num: 4, title: '第一次 AI 实验', badge: '实验徽章', badgeIcon: '🔬',
            summary: '用免编程工具完成采集→训练→测试全流程，理解样本数量、均衡性、背景对结果的影响。',
            tryIt: '用免编程工具训练一个图像分类器，记录准确率变化',
            activities: [
                { icon: '🔬', title: '采集-训练-测试', type: 'experiment', typeLabel: '做实验', desc: '亲手完成一次完整的AI训练实验' },
                { icon: '⚖️', title: '样本均衡与背景', type: 'knowledge', typeLabel: '学原理', desc: '样本多少、类别均衡、背景干扰如何影响结果' },
                { icon: '🏅', title: '获得实验徽章', type: 'gem', typeLabel: '集徽章', desc: '完成第一次AI实验' },
            ],
        },
        {
            num: 5, title: '给 AI 打分', badge: '评价徽章', badgeIcon: '📈',
            summary: '准确率、混淆矩阵、错误案例分析——学会用数据评价AI表现，而不只凭"感觉"。',
            tryIt: '分析一个模型的混淆矩阵，找出最容易混淆的类别并解释原因',
            activities: [
                { icon: '📈', title: '准确率与混淆矩阵', type: 'knowledge', typeLabel: '学原理', desc: '用数字而不是感觉来评价AI' },
                { icon: '🔍', title: '错误案例分析', type: 'knowledge', typeLabel: '学原理', desc: '从错误中找规律，改进模型' },
                { icon: '🏅', title: '获得评价徽章', type: 'gem', typeLabel: '集徽章', desc: '学会科学评价AI表现' },
            ],
        },
        {
            num: 6, title: '生成式 AI 的真相', badge: '真相徽章', badgeIcon: '💡',
            summary: '生成式AI的工作原理：概率预测下一个词/像素，不是"理解"而是"猜得像"。幻觉为何产生。',
            tryIt: '设计三个能引发AI幻觉的问题，分析幻觉产生的原因',
            activities: [
                { icon: '💡', title: '概率预测原理', type: 'knowledge', typeLabel: '学原理', desc: '生成式AI预测下一个词，不是理解而是猜得像' },
                { icon: '🎭', title: '幻觉的产生', type: 'knowledge', typeLabel: '学原理', desc: '为什么AI会一本正经地编造信息' },
                { icon: '🏅', title: '获得真相徽章', type: 'gem', typeLabel: '集徽章', desc: '理解生成式AI的原理与局限' },
            ],
        },
        {
            num: 7, title: '从模型到产品', badge: '产品徽章', badgeIcon: '🏗️',
            summary: '一个AI功能怎样变成完整应用——从模型到产品需要设计交互、处理异常、考虑用户体验。',
            tryIt: '为一个AI功能设计完整的产品方案（交互、异常处理、用户体验）',
            activities: [
                { icon: '🏗️', title: '给一个想法盖楼', type: 'experiment', typeLabel: '做实验', desc: '从模型到产品的完整设计' },
                { icon: '🎨', title: '交互与异常处理', type: 'knowledge', typeLabel: '学原理', desc: 'AI产品不只有模型，还要考虑用户体验' },
                { icon: '🏅', title: '获得产品徽章', type: 'gem', typeLabel: '集徽章', desc: '学会从模型到产品的设计' },
            ],
        },
        {
            num: 8, title: '与 AI 共处', badge: '共处徽章', badgeIcon: '🌐',
            summary: '信息茧房、深度伪造、隐私与偏见、版权与AI作业——学会负责任地与AI共处：先核验再传播，如实标注，保护自己。',
            tryIt: '和家人商量"我能用哪些 AI 工具、哪些不能用"，写一条双方都同意的使用约定',
            activities: [
                { icon: '🌐', title: '信息茧房与算法推荐', type: 'knowledge', typeLabel: '学原理', desc: '算法只给你看喜欢的，长期世界变窄' },
                { icon: '🎭', title: '深度伪造与隐私偏见', type: 'knowledge', typeLabel: '学原理', desc: '先核实再传播；不传人脸、不写真名、不透露住址' },
                { icon: '🗣️', title: '伦理辩论会', type: 'experiment', typeLabel: '做实验', desc: '从正反两方分析AI的社会影响' },
                { icon: '🏅', title: '获得共处徽章', type: 'gem', typeLabel: '集徽章', desc: '学会辩证思考与负责任地使用AI' },
            ],
        },
        {
            num: 9, title: '我的 AI 项目', badge: '项目徽章', badgeIcon: '🏁',
            summary: '围绕校园或社区的真实问题做原型：项目报告 8 板块——问题定义、数据来源、系统流程、实验过程、错误案例、改进方案、隐私伦理、展示反思。',
            tryIt: '为小组项目填写《项目报告》的"问题定义"与"错误案例"板块，3 分钟向全班介绍',
            activities: [
                { icon: '🎯', title: '真实问题与原型', type: 'try-it', typeLabel: '动手做', desc: '围绕校园/社区的真实问题做原型' },
                { icon: '📋', title: '项目报告 8 板块', type: 'knowledge', typeLabel: '学原理', desc: '不只展示结果，更要记录数据来源与错误案例' },
                { icon: '🎤', title: '展示与反思', type: 'experiment', typeLabel: '做实验', desc: '3 分钟向全班介绍，接受提问与复盘' },
                { icon: '🏅', title: '获得项目徽章', type: 'gem', typeLabel: '集徽章', desc: '完成综合项目，拿到最高荣誉' },
            ],
        },
    ],
    treasureBlurb: '九枚实验徽章宝库',
    gems: [
        { icon: '🔧', name: '解剖徽章', island: 'AI系统解剖室', desc: '拆开AI看五部件结构' },
        { icon: '📊', name: '数据徽章', island: '数据侦探营', desc: '数据五站旅程与质量' },
        { icon: '🧮', name: '算法徽章', island: '算法的工具箱', desc: '四类学习任务与工具' },
        { icon: '🔬', name: '实验徽章', island: '第一次AI实验', desc: '采集-训练-测试全流程' },
        { icon: '📈', name: '评价徽章', island: '给AI打分', desc: '准确率与混淆矩阵' },
        { icon: '💡', name: '真相徽章', island: '生成式AI的真相', desc: '概率预测与幻觉' },
        { icon: '🏗️', name: '产品徽章', island: '从模型到产品', desc: 'AI产品设计与交互' },
        { icon: '🌐', name: '共处徽章', island: '与 AI 共处', desc: '信息茧房、深度伪造、隐私与偏见' },
        { icon: '🏁', name: '项目徽章', island: '我的 AI 项目', desc: '真实问题原型与 8 板块报告' },
    ],
    safetyTips: [
        { icon: '📊', title: '数据质量决定模型', text: 'AI 的能力取决于训练数据——垃圾进，垃圾出。学会关注数据来源与质量。' },
        { icon: '⚖️', title: '辩证看待AI', text: 'AI不是万能也不是万恶——用证据说话，从数据、模型、评价三方面分析。' },
    ],
}

export function getCourseData(stage: string, grade: string): CourseData {
    if (stage === 'secondary') return secondary
    if (['grade1', 'grade2', 'grade3'].includes(grade)) return elementaryLow
    return elementaryHigh
}
