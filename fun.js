// ===== متغیرها =====
let dat_timer = [5,5,5]; // مقدار پیش‌فرض pomodoro, short, long
const apply_button = document.querySelector(".applybutton");
const timer_inputs = document.querySelectorAll(".timer-inputs"); // فرض: ترتیب: pomodoro, short, long
const counter = document.querySelector(".counter");
const pomodoro = document.querySelector(".pomodoro");
const short_break = document.querySelector(".short-break");
const long_break = document.querySelector(".long-break");
const startBtn = document.querySelector(".start");

let currentMode = 0; // 0 = pomodoro, 1 = short, 2 = long
let minutes = dat_timer[0];
let seconds = 0;

let intervalId = null;
let isTicking = false; // آیا setInterval فعال است؟
let isActive = false;  // آیا تا به حال استارت زده شده (برای تشخیص Resume)


// ===== کمک‌کننده‌ها =====
function readInputsToArray() {
  // خواندن ورودی‌ها به صورت امن و تبدیل به عدد (با fallback)
  const arr = [];
  timer_inputs.forEach((el, idx) => {
    const v = Number(el.value);
    arr.push(!isNaN(v) && v >= 0 ? Math.floor(v) : dat_timer[idx]); // اگر نامعتبر بود، مقدار قبلی نگه داشته شود
  });
  dat_timer = arr;
}

function displayTime(min, sec) {
  const m = min < 10 ? "0" + min : String(min);
  const s = sec < 10 ? "0" + sec : String(sec);
  counter.innerHTML = `${m}:${s}`;
}

function clearIntervalSafe() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function startInterval() {
  clearIntervalSafe();
  isTicking = true;
  isActive = true;
  startBtn.innerText = "Pause";

  intervalId = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearIntervalSafe();
        isTicking = false;
        isActive = false;
        startBtn.innerText = "Start";
        displayTime(0,0);
        // می‌تونی اینجا صدا یا اعلان بذاری
        alert("⏰ زمان تمام شد!");
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    displayTime(minutes, seconds);
  }, 1000);
}

function stopIntervalButKeepState() {
  clearIntervalSafe();
  isTicking = false;
  startBtn.innerText = "Resume";
}

// این تابع برای زمانی که کاربر بین مودها جابجا می‌شود
// index: مود جدید
// options:
//   preserveProgress: اگر true و قبلأ تایمر در حالت active بوده، تلاش می‌کنیم progress قبلی حفظ شود (در این پیاده‌سازی ساده مقدار جدید جایگزین می‌شود)
function switchMode(index) {
  currentMode = index;
  // همیشه آخرین ورودی‌ها رو بخون
  readInputsToArray();

  // مقدار جدید را ست می‌کنیم (شروع از دقیقه کامل، ثانیه صفر)
  minutes = Number(dat_timer[currentMode]) || 0;
  seconds = 0;

  // اگر الان در حال اجرا هستیم (isTicking true) => interval را ریست می‌کنیم و از مقدار جدید ادامه می‌دهیم
  if (isTicking) {
    startInterval(); // شروع مجدد با minutes/seconds جدید
  } else {
    // اگر paused یا هنوز start نزده‌ایم، فقط نمایش را به‌روزرسانی کن
    displayTime(minutes, seconds);
    // اگر قبلاً استارت زده و الان paused هستیم، متن دکمه باید Resume باشد
    if (isActive && !isTicking) {
      startBtn.innerText = "Resume";
    } else {
      startBtn.innerText = "Start";
    }
  }
}


// ===== event listeners =====

// Apply: خواندن ورودی‌ها و نمایش حالت فعلی (معمولاً pomodoro پیش‌فرض)
apply_button.addEventListener("click", () => {
  readInputsToArray();
  // اگر می‌خوای apply فقط مقدار فعلی مد را آپدیت کن:
  minutes = Number(dat_timer[currentMode]) || 0;
  seconds = 0;
  displayTime(minutes, seconds);
  const modalEl = document.getElementById('staticBackdrop');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  // apply بهتره موجب تغییر وضعیت run/pause نشه
});

// حالت‌ها
pomodoro.addEventListener("click", () => switchMode(0));
short_break.addEventListener("click", () => switchMode(1));
long_break.addEventListener("click", () => switchMode(2));

// دکمه Start / Pause / Resume (یک دکمه سه حالته)
startBtn.addEventListener("click", () => {
  // اگر الان در حال شمارشیم -> pause کن
  if (isTicking) {
    stopIntervalButKeepState();
    return;
  }

  // اگر paused هستیم (isActive true، isTicking false) -> resume
  if (isActive && !isTicking) {
    startInterval();
    return;
  }

  // حالت عادی Start (هنوز استارت نزده)
  readInputsToArray();
  minutes = Number(dat_timer[currentMode]) || 0;
  seconds = 0;
  startInterval();
});


// ===== نمایش اولیه =====
displayTime(minutes, seconds);
// === تنظیم پیش‌فرض Pomodoro هنگام لود صفحه ===
window.addEventListener("load", () => {
    // خواندن مقادیر ورودی‌ها
    readInputsToArray();
  
    // تنظیم روی مود pomodoro
    currentMode = 0;
    minutes = Number(dat_timer[currentMode]) || 0;
    seconds = 0;
  
    displayTime(minutes, seconds);
    setActiveMode(pomodoro); // رنگ نارنجی بده به دکمه pomodoro
  });
  
  
  // === تابع کمکی برای رنگ فعال ===
  function setActiveMode(activeBtn) {
    // حذف حالت active از همه دکمه‌ها
    [pomodoro, short_break, long_break].forEach(btn =>
      btn.classList.remove("active")
    );
    // افزودن حالت active به دکمه فعلی
    activeBtn.classList.add("active");
  }
  
  
  // === تغییر مودها با رنگ ===
  pomodoro.addEventListener("click", () => {
    switchMode(0);
    setActiveMode(pomodoro);
  });
  
  short_break.addEventListener("click", () => {
    switchMode(1);
    setActiveMode(short_break);
  });
  
  long_break.addEventListener("click", () => {
    switchMode(2);
    setActiveMode(long_break);
  });
  