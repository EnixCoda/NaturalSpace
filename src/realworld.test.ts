import { processText } from './processText';
import { processInput } from './processInput';

/**
 * Real-world challenge tests sourced from:
 * - Chinese Copywriting Guidelines (sparanoid/chinese-copywriting-guidelines)
 * - pangu.js test fixtures (vinta/pangu.js)
 * - autocorrect edge cases (huacnlee/autocorrect)
 * - Real product copy from Apple, Microsoft, tech blogs
 * - Common user-reported pain points in CJK text formatters
 */

const t = (input: string, expected: string, preferences?: Preferences) => {
  const result = processText(input, preferences);
  expect(result).toEqual(expected);
  expect(processText(result, preferences)).toEqual(expected); // idempotency
};

const ti = (input: string, expected: string, preferences?: Preferences) => {
  const result = processInput(input, preferences);
  expect(result).toEqual(expected);
  expect(processInput(result, preferences)).toEqual(expected); // idempotency
};

// ─── 1. Chinese Copywriting Guidelines conformance ──────────────────

describe('real-world - copywriting guidelines', () => {
  it('space before/after English words (basic rule)', () => {
    t('在LeanCloud上，數據儲存是圍繞AVObject進行的', '在 LeanCloud 上，數據儲存是圍繞 AVObject 進行的');
  });

  it('space before/after numbers', () => {
    t('今天出去買菜花了5000元', '今天出去買菜花了 5000 元');
  });

  it('space between numbers and units', () => {
    t('我家的光纖入屋寬頻有10Gbps', '我家的光纖入屋寬頻有 10 Gbps');
  });

  it('space after degree symbol before CJK', () => {
    // add_space_after_units correctly adds space after ° before CJK, same as %
    t('角度為90°的角，就是直角', '角度為 90° 的角，就是直角');
  });

  it('no space between number and percent', () => {
    t('新MacBook Pro有15%的CPU性能提升', '新 MacBook Pro 有 15% 的 CPU 性能提升');
  });

  it('no space before/after full-width punctuation', () => {
    t('剛剛買了一部iPhone，好開心！', '剛剛買了一部 iPhone，好開心！');
  });

  it('half-width parentheses with English content get spaces', () => {
    // use_full_width_brackets_if_CJK only converts when content is CJK
    // English content stays half-width with spaces added
    t('核磁共振成像(NMRI)是什麼原理', '核磁共振成像 (NMRI) 是什麼原理');
  });

  it('half-width punctuation inside full-width quotes', () => {
    // Straight quotes stay straight when content has no CJK (only step 5 converts CJK-containing quotes)
    t('賈伯斯那句話是怎麼說的？"Stay hungry, stay foolish."', '賈伯斯那句話是怎麼說的？"Stay hungry, stay foolish."');
  });

  it('fullwidth numbers should be converted to halfwidth', () => {
    t('這件蛋糕只賣１０００元', '這件蛋糕只賣 1000 元');
  });
});

// ─── 2. pangu.js fixture challenges ─────────────────────────────────

describe('real-world - pangu.js fixtures', () => {
  it('novel text with English names', () => {
    t('Sephiroth見到他這等神情，也是悚然一驚', 'Sephiroth 見到他這等神情，也是悚然一驚');
  });

  it('mixed English names in Traditional Chinese', () => {
    t('不足以報太師父和Red XIII的大恩', '不足以報太師父和 Red XIII 的大恩');
  });

  it('percentage CJK boundary', () => {
    t('構造成分有95%是眼鏡', '構造成分有 95% 是眼鏡');
  });

  it('decimal number in CJK text', () => {
    t('請問Jackey的鼻子有幾個?3.14個', '請問 Jackey 的鼻子有幾個？3.14 個');
  });

  it('multiple percentages in one sentence', () => {
    t('有95%是眼鏡、3%是水、2%是垃圾', '有 95% 是眼鏡、3% 是水、2% 是垃圾');
  });
});

// ─── 3. autocorrect edge cases ──────────────────────────────────────

describe('real-world - autocorrect edge cases', () => {
  it('CJK-dash-CJK should keep dash (not a minus)', () => {
    // NaturalSpace treats this as regular text, no space around dash between CJK
    t('前端-后端', '前端-后端');
  });

  it('letter-dash-CJK adds space around dash', () => {
    t('foo-世界', 'foo - 世界');
  });

  it('bracket spacing near CJK', () => {
    t('你好[世界]的', '你好[世界]的');
  });

  it('backtick inline code near CJK', () => {
    t('运行`npm install`命令', '运行 `npm install` 命令');
  });

  it('C++ and C# near CJK', () => {
    t('学习C++语言', '学习 C++ 语言');
    t('学习C#语言', '学习 C# 语言');
  });

  it('pipe and plus symbols near CJK', () => {
    t('得到A+评分', '得到 A+ 评分');
  });
});

// ─── 4. Scientific & technical notation ─────────────────────────────

describe('real-world - scientific notation', () => {
  it('PM2.5 air quality measurement', () => {
    t('今天PM2.5指数为35', '今天 PM2.5 指数为 35');
  });

  it('vitamin B12 should not split', () => {
    t('补充维生素B12很重要', '补充维生素 B12 很重要');
  });

  it('H2O chemical formula', () => {
    t('一杯H2O就是一杯水', '一杯 H2O 就是一杯水');
  });

  it('CO2 emissions', () => {
    t('减少CO2排放', '减少 CO2 排放');
  });

  it('IP address in text', () => {
    t('服务器地址是192.168.1.1端口8080', '服务器地址是 192.168.1.1 端口 8080');
  });

  it('scientific notation with exponent', () => {
    t('光速约为3e8m/s', '光速约为 3e8m/s');
  });

  it('4K resolution as single-letter unit', () => {
    t('支持4K分辨率', '支持 4K 分辨率');
  });

  it('1080p as single-letter unit', () => {
    t('支持1080p视频', '支持 1080p 视频');
  });

  it('WiFi 6 standard', () => {
    t('支持WiFi6标准', '支持 WiFi6 标准');
  });

  it('USB3.0 interface', () => {
    t('配备USB3.0接口', '配备 USB3.0 接口');
  });
});

// ─── 5. Phone numbers, dates, codes ─────────────────────────────────

describe('real-world - formatted numbers', () => {
  it('Chinese phone number with area code', () => {
    t('电话010-12345678联系', '电话 010-12345678 联系');
  });

  it('mobile phone number', () => {
    t('手机号13800138000请联系', '手机号 13800138000 请联系');
  });

  it('ISBN with dashes', () => {
    t('ISBN978-7-111-11111-1', 'ISBN978-7-111-11111-1');
  });

  it('version number comparison', () => {
    t('从v2.0升级到v3.0版本', '从 v2.0 升级到 v3.0 版本');
  });

  it('build number', () => {
    t('当前版本号为Build20230615稳定版', '当前版本号为 Build20230615 稳定版');
  });

  it('time range with dash', () => {
    t('营业时间9:00-18:00欢迎光临', '营业时间 9:00-18:00 欢迎光临');
  });

  it('date range', () => {
    t('活动时间2024-01-01至2024-12-31有效', '活动时间 2024-01-01 至 2024-12-31 有效');
  });

  it('temperature range', () => {
    t('温度范围-20°至50°适用', '温度范围 -20° 至 50° 适用');
  });

  it('dimensions with multiplication sign x', () => {
    t('房间大小3x4米', '房间大小 3x4 米');
  });
});

// ─── 6. Real product copy (Apple/Microsoft style) ───────────────────

describe('real-world - product copy', () => {
  it('Apple product description', () => {
    t(
      'MacBook Air配备M3芯片,8GB统一内存,256GB SSD存储,支持18小时电池续航.',
      'MacBook Air 配备 M3 芯片，8 GB 统一内存，256 GB SSD 存储，支持 18 小时电池续航。'
    );
  });

  it('iPhone camera specs', () => {
    t(
      'iPhone15 Pro Max搭载4800万像素主摄,支持5倍光学变焦.',
      'iPhone15 Pro Max 搭载 4800 万像素主摄，支持 5 倍光学变焦。'
    );
  });

  it('app store description', () => {
    t('超过100万用户的选择,评分4.9星,下载量突破500万次.', '超过 100 万用户的选择，评分 4.9 星，下载量突破 500 万次。');
  });

  it('Microsoft product text', () => {
    // Commas between English words stay half-width (character-adjacency based)
    t(
      '使用Microsoft365即可获得Word,Excel,PowerPoint等全套办公软件.',
      '使用 Microsoft365 即可获得 Word, Excel, PowerPoint 等全套办公软件。'
    );
  });

  it('gaming hardware specs', () => {
    // Trailing period after English stays half-width (not adjacent to CJK)
    t(
      '配备NVIDIA RTX4090显卡,32GB DDR5内存,2TB NVMe SSD.',
      '配备 NVIDIA RTX4090 显卡，32 GB DDR5 内存，2 TB NVMe SSD.'
    );
  });
});

// ─── 7. Social media & messaging style ──────────────────────────────

describe('real-world - social media', () => {
  it('WeChat-style message with emoji', () => {
    t('今天去吃了好吃的ramen🍜超级推荐！', '今天去吃了好吃的 ramen🍜超级推荐！');
  });

  it('hashtag-style tags in Chinese', () => {
    t('#今日份好心情#分享给大家', '#今日份好心情 #分享给大家');
  });

  it('@mention in CJK context', () => {
    t('请@张三来review代码', '请 @张三来 review 代码');
  });

  it('mixed emoticons and text', () => {
    t('开心^_^今天天气真好', '开心^_^今天天气真好');
  });

  it('bilibili-style danmaku', () => {
    t('前方高能warning！', '前方高能 warning！');
  });
});

// ─── 8. Legal/formal documents ──────────────────────────────────────

describe('real-world - formal documents', () => {
  it('contract party designation — bracket regex matches across pairs', () => {
    // Known limitation: the bracket regex matches across bracket pairs when CJK exists between them
    // (Party A)与乙方(Party B) → first ( matches across to last ) because CJK exists between
    t('甲方(Party A)与乙方(Party B)签订本合同', '甲方（Party A) 与乙方 (Party B）签订本合同');
  });

  it('legal article reference', () => {
    t('根据《中华人民共和国民法典》第1条规定', '根据《中华人民共和国民法典》第 1 条规定');
  });

  it('formal percentage', () => {
    t('年利率不超过24%的部分，人民法院予以保护', '年利率不超过 24% 的部分，人民法院予以保护');
  });

  it('RMB currency amount', () => {
    t('合同金额为人民币¥100,000元整', '合同金额为人民币¥100,000 元整');
  });
});

// ─── 9. Technical documentation ─────────────────────────────────────

describe('real-world - technical docs', () => {
  it('API endpoint description — BUG: space removed before /path', () => {
    // BUG: GET /api/users → GET/api/users — space before slash gets removed
    t('调用GET /api/users接口获取用户列表', '调用 GET /api/users 接口获取用户列表');
  });

  it('HTTP status code', () => {
    t('返回HTTP200表示请求成功,404表示未找到', '返回 HTTP200 表示请求成功，404 表示未找到');
  });

  it('TCP/IP protocol reference', () => {
    t('基于TCP/IP协议栈开发', '基于 TCP/IP 协议栈开发');
  });

  it('environment variable usage', () => {
    t('配置NODE_ENV=production环境变量', '配置 NODE_ENV=production 环境变量');
  });

  it('package.json reference', () => {
    t('在package.json中添加scripts字段', '在 package.json 中添加 scripts 字段');
  });

  it('CLI command in prose', () => {
    t('执行npm run build命令编译项目', '执行 npm run build 命令编译项目');
  });

  it('error message with code', () => {
    t('报错TypeError: Cannot read properties of undefined', '报错 TypeError: Cannot read properties of undefined');
  });

  it('regex pattern in text', () => {
    // Regex-like content — slashes should not trigger URL detection
    t('使用正则/[a-z]+/匹配小写字母', '使用正则/[a-z]+/匹配小写字母');
  });

  it('git commit hash', () => {
    t('回退到commit abc123f版本', '回退到 commit abc123f 版本');
  });

  it('Docker image reference — BUG: colon gets space in identifier', () => {
    // BUG: node:18-alpine → node: 18-alpine — colon adds space before number
    t('拉取node:18-alpine镜像', '拉取 node:18-alpine 镜像');
  });
});

// ─── 10. E-commerce & marketplace ───────────────────────────────────

describe('real-world - e-commerce', () => {
  it('product listing with price', () => {
    t('原价¥299,现价¥199,立省100元!', '原价¥299，现价¥199，立省 100 元！');
  });

  it('shipping info', () => {
    t('满99元包邮,预计3-5天送达', '满 99 元包邮，预计 3-5 天送达');
  });

  it('product dimensions — BUG: units get split and × spacing inconsistent', () => {
    // BUG: 100cm× → 100 cm× (space between number and unit is ok,
    //       but cm× gets space only after ×, not before — inconsistent)
    t('尺寸:长100cm×宽50cm×高30cm', '尺寸：长 100 cm × 宽 50 cm × 高 30 cm');
  });

  it('star rating', () => {
    t('用户评价4.8分,共12345条评论', '用户评价 4.8 分，共 12345 条评论');
  });

  it('discount percentage', () => {
    t('限时8折优惠,再享满200减30', '限时 8 折优惠，再享满 200 减 30');
  });
});

// ─── 11. Multi-URL real-world (processInput) ────────────────────────

describe('real-world - URLs in context', () => {
  it('documentation link in instruction', () => {
    ti('详情请参考https://docs.example.com/guide的说明文档', '详情请参考 https://docs.example.com/guide 的说明文档');
  });

  it('GitHub repository link', () => {
    ti('源码托管在https://github.com/user/repo欢迎star', '源码托管在 https://github.com/user/repo 欢迎 star');
  });

  it('email in tech support context', () => {
    ti('如有问题请联系support@company.com或拨打400-123-4567', '如有问题请联系 support@company.com 或拨打 400-123-4567');
  });

  it('URL at end of sentence with period', () => {
    ti('官网地址是https://example.com.', '官网地址是 https://example.com.');
  });
});

// ─── 12. Japanese & Korean specific ─────────────────────────────────

describe('real-world - Japanese text', () => {
  it('Japanese with English brand names', () => {
    t('AppleのiPhone15 Proは最高のスマートフォンです', 'Apple の iPhone15 Pro は最高のスマートフォンです');
  });

  it('katakana loanword with English original', () => {
    // Half-width parens with English content stay half-width with spaces
    t('プログラミング(programming)を学ぶ', 'プログラミング (programming) を学ぶ');
  });

  it('mixed hiragana katakana and Latin', () => {
    t('データベースにMySQL5.7を使用する', 'データベースに MySQL5.7 を使用する');
  });
});

describe('real-world - Korean text', () => {
  it('Korean with English tech terms', () => {
    t('Python3.12를사용하여개발합니다', 'Python3.12 를사용하여개발합니다');
  });

  it('Korean product specs', () => {
    t('16GB메모리와512GB SSD를탑재', '16 GB 메모리와 512 GB SSD 를탑재');
  });
});

// ─── 13. Edge cases from community reports ──────────────────────────

describe('real-world - community-reported edge cases', () => {
  it('slash-separated terms should not break', () => {
    t('使用前端/后端分离架构', '使用前端/后端分离架构');
  });

  it('parenthetical translation', () => {
    // Half-width parens with English content stay half-width with spaces
    t('机器学习(Machine Learning)领域', '机器学习 (Machine Learning) 领域');
  });

  it('em-dash in Chinese writing', () => {
    t('他的回答——很简洁——让人印象深刻', '他的回答——很简洁——让人印象深刻');
  });

  it('book title marks 《》 should be preserved', () => {
    t('推荐阅读《设计模式》和《重构》', '推荐阅读《设计模式》和《重构》');
  });

  it('nested quotes', () => {
    // Curly quotes now get space from CJK (excluded from no_space_around_full_width_punctuation)
    t('老师说"请翻到第10页"', '老师说 \u201c请翻到第 10 页\u201d');
  });

  it('ellipsis in Chinese', () => {
    t('等等......还有更多', '等等......还有更多');
  });

  it('multiple English words in CJK sentence', () => {
    t('这个feature在next sprint中会implement', '这个 feature 在 next sprint 中会 implement');
  });

  it('year-month format', () => {
    t('发布于2024年3月', '发布于 2024 年 3 月');
  });

  it('mixed Traditional and Simplified Chinese', () => {
    t('繁體中文和简体中文都支持UTF-8编码', '繁體中文和简体中文都支持 UTF-8 编码');
  });

  it('numbered list items — BUG: period converted to full-width', () => {
    // BUG: 1. → 1。 — period after single digit gets converted to full-width
    t('1.安装Node.js', '1. 安装 Node.js');
  });

  it('comma-separated English in CJK', () => {
    // Commas between English words stay half-width (character-adjacency based)
    t('支持HTML,CSS,JavaScript等前端技术', '支持 HTML, CSS, JavaScript 等前端技术');
  });
});

// ─── 14. Long paragraph stress ──────────────────────────────────────

describe('real-world - long paragraphs', () => {
  it('tech blog introduction paragraph', () => {
    t(
      '本文将介绍如何使用TypeScript和React18构建一个高性能的Web应用.我们将使用Next.js13作为框架,Tailwind CSS作为样式方案,PostgreSQL作为数据库.',
      '本文将介绍如何使用 TypeScript 和 React18 构建一个高性能的 Web 应用。我们将使用 Next.js13 作为框架，Tailwind CSS 作为样式方案，PostgreSQL 作为数据库。'
    );
  });

  it('product announcement', () => {
    t(
      '我们很高兴地宣布,Product X v2.0正式发布!新版本带来了超过50项改进,包括全新的UI设计,性能提升达200%,以及对ARM64架构的原生支持.',
      '我们很高兴地宣布，Product X v2.0 正式发布！新版本带来了超过 50 项改进，包括全新的 UI 设计，性能提升达 200%，以及对 ARM64 架构的原生支持。'
    );
  });

  it('academic abstract style — some commas stay half-width in Latin context', () => {
    // Limitation: commas between Latin tokens (76.5%,Top-5 and GPU, batch) stay half-width
    // because the fullwidth converter only fires near CJK/fullwidth chars
    t(
      '本研究采用ResNet50模型对ImageNet数据集进行分类,在Top-1准确率上达到了76.5%,Top-5准确率达到93.2%.实验使用8块NVIDIA A100 GPU,batch size为256,训练200个epoch.',
      '本研究采用 ResNet50 模型对 ImageNet 数据集进行分类，在 Top-1 准确率上达到了 76.5%,Top-5 准确率达到 93.2%。实验使用 8 块 NVIDIA A100 GPU, batch size 为 256，训练 200 个 epoch.'
    );
  });
});

// ─── 15. Tricky ambiguity cases ─────────────────────────────────────

describe('real-world - tricky ambiguity', () => {
  it('period after English abbreviation — BUG: converted to full-width', () => {
    // BUG: Inc. → Inc。 — abbreviation period gets converted to full-width
    t('由Google Inc.开发', '由 Google Inc. 开发');
  });

  it('colon in ratio format', () => {
    // 16:9 is an aspect ratio, not time — colon should not get space
    t('屏幕比例为16:9的显示器', '屏幕比例为 16:9 的显示器');
  });

  it('forward slash between CJK words', () => {
    t('输入/输出操作', '输入/输出操作');
  });

  it('ampersand in brand names', () => {
    t('使用AT&T网络', '使用 AT&T 网络');
  });

  it('dot in domain-like identifiers', () => {
    t('配置application.properties文件', '配置 application.properties 文件');
  });

  it('question mark at end of CJK question', () => {
    t('你知道React是什么吗?', '你知道 React 是什么吗？');
  });

  it('exclamation in excitement with CJK', () => {
    t('太好了!终于成功了!', '太好了！终于成功了！');
  });

  it('mixed width parentheses should normalize', () => {
    // (中文) → （中文）
    t('测试(通过)完成', '测试（通过）完成');
  });
});
