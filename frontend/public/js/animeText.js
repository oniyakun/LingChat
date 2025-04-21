class TypeWriter {
  constructor(element) {
    this.element = element;
    this.timer = null;
    this.abortController = null;
    this.speed;
  }

  start(text, numSpeed) {
    // 停止上一个动画
    this.stop();
    
    // 简化类型处理，确保一致性
    this.speed = Number.isInteger(numSpeed) ? numSpeed : Number.parseInt(numSpeed || "50", 10);
    
    this.abortController = new AbortController();
    let i = 0;
    this.element.value = "";

    this.timer = setInterval(() => {
      if (this.abortController.signal.aborted) {
        clearInterval(this.timer);
        return;
      }

      if (i < text.length) {
        this.element.value += text.charAt(i);
        i++;
        this.element.scrollTop = this.element.scrollHeight;
      } else {
        this.stop();
        this.element.style.borderRight = "none";
      }
    }, this.speed);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
