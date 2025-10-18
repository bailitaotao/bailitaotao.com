/**
 * Addressnake
 */
'use strict';

// ===== 游戏常量 =====
var GRID_WIDTH = 40;              // 游戏网格宽度（单位：字符）
var SNAKE_CELL = 1;               // 蛇身单元格标记
var FOOD_CELL = 2;                // 食物单元格标记
var UP = {x: 0, y: -1};           // 上方向
var DOWN = {x: 0, y: 1};          // 下方向
var LEFT = {x: -1, y: 0};         // 左方向
var RIGHT = {x: 1, y: 0};         // 右方向
var INITIAL_SNAKE_LENGTH = 4;     // 蛇的初始长度
var BRAILLE_SPACE = '\u2800';     // 盲文空格字符（用于在URL中绘制游戏画面）

// ===== 游戏状态变量 =====
var grid;                         // 游戏网格数组
var snake;                        // 蛇身坐标数组
var currentDirection;             // 当前移动方向
var moveQueue;                    // 移动方向队列（用于缓冲快速按键）
var hasMoved;                     // 是否已经移动过（用于判断是否记录最高分）
var gamePaused = false;           // 游戏是否暂停
var whitespaceReplacementChar;    // 空白字符替换字符（某些浏览器会转义URL中的空白）

/**
 * 主函数 - 初始化并启动游戏
 */
function main() {
  detectBrowserUrlWhitespaceEscaping();   // 检测浏览器是否转义URL中的空白字符
  cleanUrl();                             // 清理URL（移除查询参数和尾部斜杠）
  setupEventHandlers();                   // 设置事件监听器
  startGame();                            // 开始游戏

  // 游戏主循环
  var lastFrameTime = Date.now();
  window.requestAnimationFrame(function frameHandler() {
    var now = Date.now();
    // 当游戏未暂停且达到更新间隔时更新游戏状态
    if (!gamePaused && now - lastFrameTime >= tickTime()) {
      updateWorld();    // 更新游戏逻辑
      drawWorld();      // 绘制游戏画面到URL
      lastFrameTime = now;
    }
    window.requestAnimationFrame(frameHandler);  // 继续下一帧
  });
}

/**
 * 检测浏览器是否会转义URL中的空白字符
 * 某些浏览器出于安全考虑会转义URL中的空白字符
 */
function detectBrowserUrlWhitespaceEscaping() {
  // 尝试在URL hash中写入两个盲文空格
  history.replaceState(null, null, '#' + BRAILLE_SPACE + BRAILLE_SPACE)
  // 如果读取的hash中没有盲文空格，说明浏览器进行了转义
  if (location.hash.indexOf(BRAILLE_SPACE) == -1) {
    console.warn('Browser is escaping whitespace characters on URL')
    var replacementData = pickWhitespaceReplacementChar();
    whitespaceReplacementChar = replacementData[0];  // 使用替代字符
  }
}

/**
 * 清理URL，移除查询参数和尾部斜杠
 * 为游戏在URL中显示留出最大空间
 */
function cleanUrl() {
  history.replaceState(null, null, location.pathname.replace(/\b\/$/, ''));
}

/**
 * 设置事件监听器
 * 包括键盘控制、触屏滑动、窗口焦点等
 */
function setupEventHandlers() {
  // 键位映射表：支持方向键、WASD、HJKL（Vim风格）
  var directionsByKey = {
    37: LEFT, 38: UP, 39: RIGHT, 40: DOWN,  // 方向键
    87: UP, 65: LEFT, 83: DOWN, 68: RIGHT,  // WASD
    75: UP, 72: LEFT, 74: DOWN, 76: RIGHT   // HJKL（Vim）
  };

  // 键盘控制
  document.onkeydown = function (event) {
    var key = event.keyCode;
    if (key in directionsByKey) {
      changeDirection(directionsByKey[key]);
      event.preventDefault();  // 阻止默认行为（如页面滚动）
    }
  };

  // 触屏滑动支持
  var touchStartX = 0;
  var touchStartY = 0;
  
  // 记录触摸开始位置
  document.ontouchstart = function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  };
  
  // 触摸结束时判断滑动方向
  document.ontouchend = function(event) {
    if (!touchStartX || !touchStartY) return;
    
    var touchEndX = event.changedTouches[0].clientX;
    var touchEndY = event.changedTouches[0].clientY;
    var dx = touchEndX - touchStartX;
    var dy = touchEndY - touchStartY;
    
    // 判断是横向滑动还是纵向滑动
    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? RIGHT : LEFT);
    } else {
      changeDirection(dy > 0 ? DOWN : UP);
    }
    
    // 重置触摸位置
    touchStartX = 0;
    touchStartY = 0;
  };

  // 窗口失焦时暂停游戏
  window.onblur = function pauseGame() {
    gamePaused = true;
    window.history.replaceState(null, null, location.hash + '[paused]');
  };

  // 窗口获得焦点时恢复游戏
  window.onfocus = function unpauseGame() {
    gamePaused = false;
    drawWorld();
  };
}

/**
 * 开始新游戏
 * 初始化游戏网格、蛇的位置和方向
 */
function startGame() {
  grid = new Array(GRID_WIDTH * 4);  // 创建游戏网格（宽40，高4）
  snake = [];
  
  // 初始化蛇的位置（从左侧开始，位于中间偏上）
  for (var x = 0; x < INITIAL_SNAKE_LENGTH; x++) {
    var y = 2;
    snake.unshift({x: x, y: y});    // 将坐标添加到蛇身数组开头
    setCellAt(x, y, SNAKE_CELL);    // 在网格中标记蛇身
  }
  
  currentDirection = RIGHT;  // 初始方向向右
  moveQueue = [];            // 清空移动队列
  hasMoved = false;          // 重置移动标记
  dropFood();                // 生成第一个食物
}

/**
 * 更新游戏世界
 * 处理蛇的移动、碰撞检测、食物吃取等逻辑
 */
function updateWorld() {
  // 如果有缓冲的方向改变，应用它
  if (moveQueue.length) {
    currentDirection = moveQueue.pop();
  }

  var head = snake[0];                        // 蛇头
  var tail = snake[snake.length - 1];         // 蛇尾
  var newX = head.x + currentDirection.x;     // 计算新的头部X坐标
  var newY = head.y + currentDirection.y;     // 计算新的头部Y坐标

  // 检测是否出界
  var outOfBounds = newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= 4;
  // 检测是否撞到自己（但允许占据即将消失的尾部位置）
  var collidesWithSelf = cellAt(newX, newY) === SNAKE_CELL
    && !(newX === tail.x && newY === tail.y);

  // 如果出界或撞到自己，游戏结束
  if (outOfBounds || collidesWithSelf) {
    endGame();
    startGame();
    return;
  }

  // 检测是否吃到食物
  var eatsFood = cellAt(newX, newY) === FOOD_CELL;
  if (!eatsFood) {
    // 没吃到食物，移除蛇尾（保持长度不变）
    snake.pop();
    setCellAt(tail.x, tail.y, null);
  }

  // 添加新的蛇头
  setCellAt(newX, newY, SNAKE_CELL);
  snake.unshift({x: newX, y: newY});

  // 如果吃到食物，生成新食物（蛇长度已经增加了）
  if (eatsFood) {
    dropFood();
  }
}

/**
 * 游戏结束处理
 * 检查并保存最高分
 */
function endGame() {
  var score = currentScore();
  // 从HTML根元素获取游戏ID，用于区分不同游戏的分数
  var gameId = document.documentElement.getAttribute('data-game-id') || 'default';
  var maxScore = parseInt(localStorage.getItem(gameId + '-maxScore') || 0);
  
  // 如果当前分数超过最高分且玩家确实移动过，保存新的最高分
  if (score > 0 && score > maxScore && hasMoved) {
    localStorage.setItem(gameId + '-maxScore', score);
    console.log('New high score:', score);
  }
}

/**
 * 绘制游戏画面到URL
 * 将游戏网格转换为盲文字符串显示在浏览器地址栏
 */
function drawWorld() {
  // 构造URL hash，格式：#[score:分数]|游戏画面|
  var hash = '#[' + currentScore() + ']|' + gridString() + '|';

  // 如果需要，替换空白字符
  if (whitespaceReplacementChar) {
    hash = hash.replace(/\u2800/g, whitespaceReplacementChar);
  }

  // 使用 history.replaceState 更新URL（不会创建历史记录）
  history.replaceState(null, null, hash);

  // 某些浏览器会限制 replaceState 的调用频率
  // 如果检测到限流，使用 location.hash 作为备选方案
  if (decodeURIComponent(location.hash) !== hash) {
    console.warn('history.replaceState() throttling detected. Using location.hash fallback');
    location.hash = hash;  // 缺点：会创建历史记录
  }
}

/**
 * 将游戏网格转换为盲文字符串
 * 使用Unicode盲文字符（U+2800-U+28FF）表示游戏画面
 * 每个盲文字符可以表示2x4的点阵，正好用于压缩游戏画面
 */
function gridString() {
  var str = '';
  // 每次处理两列（因为一个盲文字符包含两列）
  for (var x = 0; x < GRID_WIDTH; x += 2) {
    // 盲文字符的8个点位对应位模式：
    // ⠁⠂⠄⠈⠐⠠⡀⢀ (从低位到高位)
    var n = 0
      | bitAt(x, 0) << 0      // 左上
      | bitAt(x, 1) << 1      // 左中上
      | bitAt(x, 2) << 2      // 左中下
      | bitAt(x + 1, 0) << 3  // 右上
      | bitAt(x + 1, 1) << 4  // 右中上
      | bitAt(x + 1, 2) << 5  // 右中下
      | bitAt(x, 3) << 6      // 左下
      | bitAt(x + 1, 3) << 7; // 右下
    // 0x2800 是盲文空格的起始码位
    str += String.fromCharCode(0x2800 + n);
  }
  return str;
}

/**
 * 计算游戏更新间隔（毫秒）
 * 蛇越长，速度越快，增加游戏难度
 */
function tickTime() {
  var start = 125;  // 初始速度（125ms一帧）
  var end = 75;     // 最快速度（75ms一帧）
  // 根据蛇的长度线性插值计算速度
  return start + snake.length * (end - start) / grid.length;
}

/**
 * 获取当前分数
 * 分数 = 蛇的长度 - 初始长度
 */
function currentScore() {
  return snake.length - INITIAL_SNAKE_LENGTH;
}

/**
 * 获取指定坐标的单元格类型
 */
function cellAt(x, y) {
  return grid[x % GRID_WIDTH + y * GRID_WIDTH];
}

/**
 * 获取指定坐标的位值（0或1）
 * 用于生成盲文字符
 */
function bitAt(x, y) {
  return cellAt(x, y) ? 1 : 0;
}

/**
 * 设置指定坐标的单元格类型
 */
function setCellAt(x, y, cellType) {
  grid[x % GRID_WIDTH + y * GRID_WIDTH] = cellType;
}

/**
 * 在随机空位置生成食物
 */
function dropFood() {
  var emptyCells = grid.length - snake.length;  // 计算空单元格数量
  if (emptyCells === 0) {
    return;  // 没有空位，游戏胜利（虽然几乎不可能）
  }
  
  // 随机选择一个空单元格
  var dropCounter = Math.floor(Math.random() * emptyCells);
  for (var i = 0; i < grid.length; i++) {
    if (grid[i] === SNAKE_CELL) {
      continue;  // 跳过蛇身占据的单元格
    }
    if (dropCounter === 0) {
      grid[i] = FOOD_CELL;  // 在这里放置食物
      break;
    }
    dropCounter--;
  }
}

/**
 * 改变蛇的移动方向
 * @param {Object} newDir - 新的方向对象 {x, y}
 */
function changeDirection(newDir) {
  var lastDir = moveQueue[0] || currentDirection;  // 获取最后一次方向（或当前方向）
  // 检查新方向是否与当前方向相反（蛇不能掉头）
  var opposite = newDir.x + lastDir.x === 0 && newDir.y + lastDir.y === 0;
  if (!opposite) {
    moveQueue.unshift(newDir);  // 将方向添加到队列（允许缓冲快速按键）
  }
  hasMoved = true;  // 标记玩家已经移动过
}

/**
 * 选择合适的字符替换盲文空格
 * 当浏览器转义URL中的空白字符时使用
 * 
 * 选择标准：
 * 1. 宽度接近盲文空格（避免画面抖动）
 * 2. 视觉上不太显眼（"暗度"足够低）
 */
function pickWhitespaceReplacementChar() {
  var candidates = [
    ['૟', 'strange symbols'],      // 古吉拉特语字符（Chrome中几乎不可见）
    ['⟋', 'some weird slashes']    // 数学上升对角线
  ];

  var N = 5;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  ctx.font = '30px system-ui';
  var targetWidth = ctx.measureText(BRAILLE_SPACE.repeat(N)).width;  // 测量目标宽度

  // 遍历候选字符，找到合适的替代字符
  for (var i = 0; i < candidates.length; i++) {
    var char = candidates[i][0];
    var str = char.repeat(N);
    var width = ctx.measureText(str).width;
    // 宽度相似度检查（误差不超过10%）
    var similarWidth = Math.abs(targetWidth - width) / targetWidth <= 0.1;

    // 渲染字符并检查"暗度"
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(str, 0, 30);
    var pixelData = ctx.getImageData(0, 0, width, 30).data;
    var totalPixels = pixelData.length / 4;
    var coloredPixels = 0;
    
    // 统计有颜色的像素数量
    for (var j = 0; j < totalPixels; j++) {
      var alpha = pixelData[j * 4 + 3];  // alpha通道
      if (alpha != 0) {
        coloredPixels++;
      }
    }
    
    // 检查是否足够"空白"（有色像素少于15%）
    var notTooDark = coloredPixels / totalPixels < 0.15;

    // 如果同时满足宽度和暗度要求，使用这个字符
    if (similarWidth && notTooDark) {
      return candidates[i];
    }
  }

  // 备选方案：使用轻度阴影字符
  return ['░', 'some kind of "fog"'];
}

// 启动游戏
main();
