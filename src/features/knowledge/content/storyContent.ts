// 1~3年级 启明星大冒险 故事内容

export type StoryPanel = {
  scene: string
  narration?: string
  dialog: { speaker: string; line: string }[]
}

export type DayStory = {
  day: number
  title: string
  island: string
  gem: string
  goal: string
  panels: StoryPanel[]
  miniLesson: { speaker: string; text: string }
  challenge: { question: string; answer: string }
}

export const stories: DayStory[] = [
  {
    day: 1, title: '启明星岛 · 认识AI', island: '启明星岛', gem: '好奇宝石',
    goal: '认识AI探险队的四位伙伴，知道AI是会看、会听、会帮忙的聪明工具。',
    panels: [
      { scene: '星空', narration: '在遥远的天空中，有一颗启明星，它守护着小朋友们的信息城堡。可是今天，启明星变暗了……',
        dialog: [] },
      { scene: '飞船内', dialog: [
        { speaker: '小多', line: '嘀嘀！我是小多！AI探险队，集合啦！' },
        { speaker: '小贝', line: '启明星变暗了，我们能帮上忙吗？' },
      ]},
      { scene: '小贝疑惑', dialog: [
        { speaker: '小贝', line: '可是……AI是什么呀？是天上的星星吗？' },
      ]},
      { scene: '博士星讲解', dialog: [
        { speaker: '博士星', line: '答案就藏在前面的小岛上！AI是会看、会听、会帮忙的聪明工具。' },
        { speaker: '小多', line: '就像我一样！' },
      ]},
      { scene: '登岛', narration: '这座岛叫启明星岛。要点亮启明星，我们要去8座知识小岛，收集8颗知识宝石！',
        dialog: [] },
      { scene: '宝石到手', dialog: [
        { speaker: '小多', line: '哇！第一颗宝石——好奇宝石到手啦！' },
        { speaker: '小贝', line: '太棒了！我们出发吧！' },
      ]},
      { scene: '飞船起飞', narration: 'AI探险队的大冒险开始啦！下一站——家居岛！',
        dialog: [] },
    ],
    miniLesson: { speaker: '博士星', text: 'AI不是魔法！它是会看的「眼睛」、会听的「耳朵」，还有会学习的小脑袋！' },
    challenge: { question: '找一找：谁是AI帮手？①会自己扫地的机器人 ②毛茸茸的小猫 ③会认照片的平板电脑', answer: '①和③都是AI帮手！小猫是我们的好朋友，不是AI哦。' },
  },
  {
    day: 2, title: '家居岛 · AI在身边', island: '家居岛', gem: '发现宝石',
    goal: '能说出3个身边的AI帮手，知道AI藏在我们的生活里。',
    panels: [
      { scene: '家居岛', dialog: [
        { speaker: '小贝', line: '哇！这里好像我的家呀！' },
        { speaker: '小多', line: '这里是家居岛，AI帮手就藏在这座房子里！' },
      ]},
      { scene: '智能音箱', narration: '叮——好听的音乐响起来啦！音箱听懂了小贝的话！',
        dialog: [{ speaker: '小贝', line: '小音箱，我想听儿歌！' }] },
      { scene: '人脸门锁', dialog: [
        { speaker: '小蓝', line: '咦？我还没敲门，门自己就开啦！' },
        { speaker: '博士星', line: '门锁认出了家人的脸，这就是AI的「眼睛」在帮忙！' },
      ]},
      { scene: '扫地机器人', dialog: [
        { speaker: '小蓝', line: '哇！它自己就把地扫干净了！好厉害！' },
        { speaker: '小多', line: '这也是AI帮手哦，它会「看」哪里脏。' },
      ]},
      { scene: '院子', dialog: [
        { speaker: '博士星', line: '你看——会听的、会看的、会帮忙的，都是AI帮手！' },
        { speaker: '小贝', line: '原来AI就在我们身边呀！' },
      ]},
      { scene: '发现宝石', dialog: [
        { speaker: '小多', line: '第二颗宝石——发现宝石！我们找到它啦！' },
        { speaker: '小贝', line: '耶！又收集了一颗！' },
      ]},
      { scene: '飞向眼睛岛', dialog: [
        { speaker: '小蓝', line: '下一座岛……好多大眼睛！' },
        { speaker: '博士星', line: '那是眼睛岛，AI的「眼睛」是怎么工作的呢？我们去看看吧！' },
      ]},
    ],
    miniLesson: { speaker: '博士星', text: 'AI藏在生活的各个角落——家里、街上、学校里，细心观察就能发现它！' },
    challenge: { question: '找一找：你的家里有哪些AI帮手呢？想一想，把它们的名字说出来吧！', answer: '比如：智能音箱、扫地机器人、人脸识别门锁、会认照片的手机……说出3个就算你赢！' },
  },
  {
    day: 3, title: '眼睛岛 · AI会「看」', island: '眼睛岛', gem: '眼睛宝石',
    goal: '知道AI能「看」（认图），是靠看很多很多例子学会的。',
    panels: [
      { scene: '眼睛岛', dialog: [
        { speaker: '小蓝', line: '哇……到处都是照片！我的头都晕了。' },
        { speaker: '博士星', line: '这座岛是AI的「眼睛」学校，我们来看看AI是怎么认东西的。' },
      ]},
      { scene: '认不出', dialog: [
        { speaker: '小蓝', line: '这是猫还是狗呀？我认不出来……' },
        { speaker: '小贝', line: '别着急，小蓝！我们来帮你！' },
      ]},
      { scene: '厚相册', dialog: [
        { speaker: '博士星', line: 'AI要先看很多很多张猫的照片，才认得猫哦。看，这些都是猫！' },
        { speaker: '小贝', line: '哇，好多好多猫！' },
      ]},
      { scene: '学认猫', dialog: [
        { speaker: '小蓝', line: '猫有尖耳朵……还有长胡须……' },
        { speaker: '小多', line: '对啦对啦！再看这一张！' },
      ]},
      { scene: '认出来啦', dialog: [
        { speaker: '小蓝', line: '它是猫！我认得啦！它有尖耳朵和长胡须！' },
        { speaker: '大家', line: '小蓝真棒！' },
      ]},
      { scene: '眼睛宝石', dialog: [
        { speaker: '小多', line: '第三颗宝石——眼睛宝石来啦！' },
        { speaker: '博士星', line: '记住哦，AI的「眼睛」是靠多看例子才学会认东西的。' },
      ]},
      { scene: '飞向耳朵岛', dialog: [
        { speaker: '小多', line: '下一站是耳朵岛！让我们去看看AI的「耳朵」吧！' },
        { speaker: '小贝', line: '好期待呀！' },
      ]},
    ],
    miniLesson: { speaker: '博士星', text: 'AI的「眼睛」叫「计算机视觉」。它看过成千上万张图片，才学会认东西——看得越多，认得越准！' },
    challenge: { question: '圈一圈：帮小蓝找小猫——下面有4张图（2只猫、2只狗），请你把所有的「猫」都圈出来！', answer: '猫有尖耳朵、长胡须，还有圆溜溜的大眼睛～多看几次，你也能像AI一样认得又快又准！' },
  },
  {
    day: 4, title: '耳朵岛 · AI会「听」', island: '耳朵岛', gem: '耳朵宝石',
    goal: '知道AI能「听」（听懂人话），把话说清楚它才听得懂。',
    panels: [
      { scene: '耳朵岛', dialog: [
        { speaker: '小贝', line: '哇！这些花都是耳朵的形状！好可爱！' },
        { speaker: '小多', line: '这里是耳朵岛，AI的「耳朵」就在这里上学呢！' },
      ]},
      { scene: '听错了', dialog: [
        { speaker: '小多', line: '嘀？不对不对！我听错啦！' },
        { speaker: '小贝', line: '怎么啦小多？我说的是「开灯」呀！' },
      ]},
      { scene: '说清楚', dialog: [
        { speaker: '小贝', line: '要说清楚口令，一个字一个字慢慢说：开——灯！' },
        { speaker: '小多', line: '嗯！我听清楚啦！' },
      ]},
      { scene: '灯亮啦', dialog: [
        { speaker: '小多', line: '听对啦！灯亮啦！小贝你好棒！' },
        { speaker: '大家', line: '耶！成功啦！' },
      ]},
      { scene: '声音太小', dialog: [
        { speaker: '小蓝', line: '开……开……（声音太小了）' },
        { speaker: '小多', line: '啊？你说什么？我听不清……' },
      ]},
      { scene: '大声说', dialog: [
        { speaker: '小贝', line: '小蓝，大声一点！你可以的！' },
        { speaker: '小蓝', line: '开——灯！（大声）' },
        { speaker: '小多', line: '听清楚啦！太棒了小蓝！' },
      ]},
      { scene: '耳朵宝石', dialog: [
        { speaker: '博士星', line: '第四颗宝石——耳朵宝石到手啦！' },
        { speaker: '小蓝', line: '我也做到了……好开心。' },
      ]},
      { scene: '飞向智慧岛', narration: '下一站——智慧岛！AI是怎么学习新本领的呢？我们去看看吧！', dialog: [] },
    ],
    miniLesson: { speaker: '博士星', text: 'AI的「耳朵」叫「语音识别」。话说得清楚、明白，它才听得懂；含含糊糊，它就会「听岔」哦！' },
    challenge: { question: '玩一玩：大声说口令！试一试，大声、清楚地说出这些口令：「打开音乐」「开灯」「播放故事」。说清楚一次就得一颗星，连续3次全对就是满分！', answer: '你真棒！说得越清楚，AI的「耳朵」就听得越明白。下次对智能音箱说话，记得要说清楚哦～' },
  },
  {
    day: 5, title: '智慧岛 · AI会「学」', island: '智慧岛', gem: '智慧宝石',
    goal: '知道AI靠「多看例子」学习，例子看得越多，认得越准。',
    panels: [
      { scene: '智慧岛果园', dialog: [
        { speaker: '小贝', line: '哇！好多水果！看起来好好吃！' },
        { speaker: '博士星', line: '这座智慧岛，就是AI学习新本领的地方。' },
      ]},
      { scene: '分不清', dialog: [
        { speaker: '小多', line: '嗯……哪个是苹果，哪个是香蕉来着？' },
        { speaker: '小蓝', line: '我也有点分不清……' },
      ]},
      { scene: '水果相册', dialog: [
        { speaker: '博士星', line: '来，先给小多看很多很多苹果的样子。看得越多，认得越准哦！' },
        { speaker: '小贝', line: '哇，有这么多张苹果的照片！' },
      ]},
      { scene: '学习中', dialog: [
        { speaker: '小多', line: '苹果是圆圆的……红红的……有个小柄……' },
        { speaker: '博士星', line: '对啦，就是这样学习的！' },
      ]},
      { scene: '认出来啦', dialog: [
        { speaker: '小多', line: '这只新果子……我也认出来啦！是苹果！' },
        { speaker: '小贝', line: '哇！小多好厉害！' },
      ]},
      { scene: '吃水果', dialog: [
        { speaker: '小蓝', line: '苹果脆脆甜甜的，真好吃～' },
        { speaker: '小多', line: '我现在能认出好多水果啦！' },
      ]},
      { scene: '智慧宝石', dialog: [
        { speaker: '博士星', line: '第五颗宝石——智慧宝石！' },
        { speaker: '小多', line: 'AI学习的秘密，就是多看多学！' },
      ]},
      { scene: '飞向时光岛', narration: '下一站是时光岛！AI是怎么长大的呢？让我们坐时光机去看看吧！', dialog: [] },
    ],
    miniLesson: { speaker: '博士星', text: 'AI学习就像交朋友——例子看得越多、相处得越久，它就认得越准。这就是「机器学习」的小秘密！' },
    challenge: { question: '猜一猜：先给小多看了3张苹果的照片、1张香蕉的照片。现在给它看一只从没见过的红果子，你猜小多更可能把它认成什么？为什么？', answer: '更可能认成苹果！因为小多看苹果的例子更多，对苹果的印象更深。这就是AI学习的小秘密——多看多学，才会越来越厉害！' },
  },
  {
    day: 6, title: '时光岛 · 机器人长大', island: '时光岛', gem: '时光宝石',
    goal: '知道AI和机器人是一点一点发展起来的，不是一下子变聪明的。',
    panels: [
      { scene: '时光岛', dialog: [
        { speaker: '小贝', line: '哇！这就是时光机吗？好神奇！' },
        { speaker: '博士星', line: '坐上时光机，我们就能看到AI是怎么长大的啦！' },
      ]},
      { scene: '过去·小零件', narration: '很久很久以前，AI还只是一个小小的零件。', dialog: [
        { speaker: '小蓝', line: '哇……它好小啊。' },
      ]},
      { scene: '稍晚·学走路', narration: '后来，科学家们给它装上了身体，它学会走路啦！', dialog: [
        { speaker: '小贝', line: '它走得摇摇晃晃的，好可爱！' },
      ]},
      { scene: '现在·大帮手', narration: '现在，AI变成了厉害的大帮手，帮我们做很多很多事情！', dialog: [
        { speaker: '小多', line: '看，我也是这样慢慢长大的哦！' },
      ]},
      { scene: '时光机内·感动', dialog: [
        { speaker: '小蓝', line: '原来……大家都是慢慢长大的呀。我也想变厉害……' },
        { speaker: '博士星', line: '别急呀小蓝，你已经在努力了，你也会越来越棒的！' },
      ]},
      { scene: '小蓝自信', dialog: [
        { speaker: '小蓝', line: '嗯！我也会加油的！一步一步来，我也能变厉害！' },
        { speaker: '小贝', line: '小蓝，我们一起加油！' },
      ]},
      { scene: '时光宝石', dialog: [
        { speaker: '博士星', line: '第六颗宝石——时光宝石！它告诉我们，每一点进步都很珍贵。' },
        { speaker: '小蓝', line: '我会好好收藏它的。' },
      ]},
      { scene: '飞向迷雾岛', dialog: [
        { speaker: '小多', line: '下一座岛……怎么雾蒙蒙的？' },
        { speaker: '博士星', line: '那是迷雾岛。在那里，我们会发现AI的一个小秘密。' },
      ]},
    ],
    miniLesson: { speaker: '博士星', text: 'AI是一步一步长大的！科学家们一代一代地努力，每一点进步都来自很多人的坚持！' },
    challenge: { question: '排一排：机器人成长顺序——①会走路的小机器人 ②厉害的大帮手机器人 ③一个孤零零的小零件', answer: '正确顺序是：③ → ① → ②。AI不是一下子变聪明的，是科学家们一步一步、一代一代努力，才让它从「小零件」长成「大帮手」的！' },
  },
  {
    day: 7, title: '迷雾岛 · AI也会错', island: '迷雾岛', gem: '思考宝石',
    goal: '知道AI不是完美的、也会犯错；要学会检查、动脑想一想，不盲信AI。',
    panels: [
      { scene: '迷雾岛', dialog: [
        { speaker: '小贝', line: '雾好大呀，什么都看不清……' },
        { speaker: '小多', line: '嘀嘀！我来带路！我的眼睛最厉害啦！' },
      ]},
      { scene: '小多指方向', dialog: [
        { speaker: '小多', line: '看！前面有一只小鸟在飞！我们跟着它走！' },
        { speaker: '博士星', line: '等一下小多，你再仔细看看？' },
      ]},
      { scene: '蝴蝶', dialog: [
        { speaker: '小多', line: '啊……对不起……我看错了，把蝴蝶当成小鸟了……' },
        { speaker: '小贝', line: '没关系啦小多，雾太大了嘛。' },
      ]},
      { scene: '大家安慰', dialog: [
        { speaker: '博士星', line: '小多别难过，AI也会犯错的，这不怪你。' },
        { speaker: '小贝', line: '对呀！我们一起再仔细看看，就不会错啦！' },
      ]},
      { scene: '大家一起看', dialog: [
        { speaker: '博士星', line: '来，我们一起当「小侦探」，仔细看一看、想一想，再下结论。' },
        { speaker: '小蓝', line: '我也来帮忙看！' },
      ]},
      { scene: '雾散了', dialog: [
        { speaker: '小多', line: '看清楚啦！是蝴蝶，不是小鸟！' },
        { speaker: '博士星', line: '你看，仔细检查一下，就不会错啦。' },
      ]},
      { scene: '思考宝石', dialog: [
        { speaker: '博士星', line: '第七颗宝石——思考宝石！' },
        { speaker: '小多', line: '以后我也要多检查、多思考，不能太骄傲了。' },
      ]},
      { scene: '飞向城堡岛', narration: '最后一站——城堡岛！信息城堡就在那里。集齐8颗宝石，就能点亮启明星！加油，AI探险队！', dialog: [] },
    ],
    miniLesson: { speaker: '博士星', text: 'AI是会犯错的好帮手！遇到不对的事，要动脑想一想、查一查，不要随便相信哦！' },
    challenge: { question: '想一想：有一天，AI告诉你「2加2等于5」。你会相信它吗？为什么？', answer: '当然不能相信！AI也会犯错的。遇到不对的事，要自己动脑想一想，再动手查一查，不能什么都信。做个爱思考的小侦探，你也能发现AI的小错误哦！' },
  },
  {
    day: 8, title: '城堡岛 · 我的秘密', island: '城堡岛', gem: '守护宝石',
    goal: '能分清哪些秘密不能告诉陌生人，记住安全提醒：住址、生日、家人电话都是「小秘密」。',
    panels: [
      { scene: '城堡岛', dialog: [
        { speaker: '小贝', line: '哇，信息城堡好大好漂亮！可是门口那个人是谁呀？' },
        { speaker: '小多', line: '小心！看起来不太对劲……' },
      ]},
      { scene: '黑影', dialog: [
        { speaker: '黑影', line: '小朋友们～你们好呀～告诉我，你们家住在哪里呀？' },
        { speaker: '黑影', line: '还有你们的生日，和爸爸妈妈的电话号码，也告诉我好不好呀？' },
      ]},
      { scene: '小贝勇敢', dialog: [
        { speaker: '小贝', line: '不行！我的秘密不能乱说！' },
        { speaker: '小贝', line: '我才不会告诉你呢！' },
      ]},
      { scene: '肩并肩', dialog: [
        { speaker: '小蓝', line: '对……不对！我们的秘密，不告诉陌生人！' },
        { speaker: '小多', line: '嘀嘀！休想骗我们！' },
      ]},
      { scene: '黑影逃跑', narration: '黑影被赶跑啦！你们真勇敢！', dialog: [
        { speaker: '博士星', line: '保护好自己的信息，就是守护信息城堡的最好办法！' },
      ]},
      { scene: '宝石汇聚', dialog: [
        { speaker: '小多', line: '最后一颗宝石——守护宝石也来啦！' },
        { speaker: '小贝', line: '八颗宝石集齐了！' },
      ]},
      { scene: '启明星亮起', narration: '信息城堡安全了！小朋友们的秘密都被好好守护着！', dialog: [
        { speaker: '大家', line: '哇！启明星亮啦！' },
      ]},
      { scene: '大合影', dialog: [
        { speaker: '博士星', line: '恭喜你们，集齐了8颗宝石，点亮了启明星！' },
        { speaker: '小多', line: '从今天起，你们就是AI启明星·小新星啦！' },
        { speaker: '大家', line: '耶！我们做到啦！' },
      ]},
    ],
    miniLesson: { speaker: '博士星', text: '记住哦——住址、生日、爸爸妈妈的电话，都是「我的小秘密」，不随便告诉别人！' },
    challenge: { question: '演一演：如果有陌生人问你「你家住在哪里呀？」「你的生日是哪一天？」「你爸爸妈妈的电话号码是多少？」你该怎么回答呢？', answer: '正确答案是——大声说「不」！然后马上告诉老师或爸爸妈妈。记住：住址、生日、爸爸妈妈的电话，都是我们的「小秘密」，不能随便告诉别人哦！' },
  },
]
