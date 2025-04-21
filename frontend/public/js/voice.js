// 语音识别模块
class VoiceRecorder {
  constructor() {
    this.micButton = document.getElementById('micButton');
    this.inputMessage = document.getElementById('inputMessage');
    this.sendButton = document.getElementById('sendButton');
    this.isRecording = false;
    this.statusDiv = document.getElementById("status");
    this.recognitionTimeout = null;
    
    // 检查浏览器是否支持语音识别
    this.recognition = null;
    this.initSpeechRecognition();
    
    // 初始化
    this.init();
    
    // 保存实例到全局对象，以便其他模块可以访问
    window.voiceRecorderInstance = this;
  }
  
  // 初始化语音识别API
  initSpeechRecognition() {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      
      // 设置语音识别参数
      this.recognition.lang = 'zh-CN'; // 设置为中文
      this.recognition.continuous = false; // 只识别一次
      this.recognition.interimResults = true; // 获取中间结果，提高响应速度
      this.recognition.maxAlternatives = 1; // 返回最可能的识别结果
      
      // 识别结果处理
      this.recognition.onresult = (event) => {
        // 如果有定时器，清除它
        if (this.recognitionTimeout) {
          clearTimeout(this.recognitionTimeout);
          this.recognitionTimeout = null;
        }
        
        // 获取最终结果或最新的中间结果
        const result = event.results[0][0].transcript;
        const isFinal = event.results[0].isFinal;
        
        console.log(`语音识别${isFinal ? '最终' : '中间'}结果:`, result);
        
        // 填入输入框（即使是中间结果也填入，给用户即时反馈）
        this.inputMessage.value = result;
        
        // 如果是最终结果，则完成识别过程
        if (isFinal) {
          this.statusDiv.textContent = "识别完成";
          
          // 自动聚焦输入框
          this.inputMessage.focus();
          
          // 自动发送消息
          setTimeout(() => {
            if (this.sendButton && !this.sendButton.disabled) {
              this.sendButton.click();
            }
          }, 500);
          
          // 结束识别
          this.stopRecording();
        }
      };
      
      // 识别结束事件
      this.recognition.onend = () => {
        console.log('语音识别结束');
        
        // 如果还有未清除的定时器，清除它
        if (this.recognitionTimeout) {
          clearTimeout(this.recognitionTimeout);
          this.recognitionTimeout = null;
        }
        
        // 取消录音状态
        this.isRecording = false;
        this.micButton.classList.remove('recording');
        
        // 更新状态提示
        if (this.inputMessage.value.trim() === '') {
          this.statusDiv.textContent = "未检测到语音，请靠近麦克风并重试";
          setTimeout(() => {
            this.statusDiv.textContent = "已连接到服务器";
          }, 3000);
        }
      };
      
      // 识别错误处理
      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        
        // 针对不同类型的错误给出具体提示
        let errorMessage = "识别错误";
        switch (event.error) {
          case 'no-speech':
            errorMessage = "未检测到语音，请靠近麦克风并重试";
            break;
          case 'audio-capture':
            errorMessage = "无法访问麦克风";
            break;
          case 'not-allowed':
            errorMessage = "麦克风访问被拒绝";
            break;
          case 'network':
            errorMessage = "网络错误，请检查网络连接";
            break;
          case 'aborted':
            errorMessage = "识别被中断";
            break;
          default:
            errorMessage = `识别错误: ${event.error}`;
        }
        
        this.statusDiv.textContent = errorMessage;
        this.isRecording = false;
        this.micButton.classList.remove('recording');
        
        setTimeout(() => {
          this.statusDiv.textContent = "已连接到服务器";
        }, 3000);
      };
      
      // 语音开始事件
      this.recognition.onspeechstart = () => {
        console.log('检测到语音开始');
        this.statusDiv.textContent = "正在识别...";
        
        // 检测到说话后，取消超时定时器
        if (this.recognitionTimeout) {
          clearTimeout(this.recognitionTimeout);
          this.recognitionTimeout = null;
        }
      };
      
      // 没有检测到讲话时的事件
      this.recognition.onnomatch = () => {
        console.log('无法匹配语音');
        this.statusDiv.textContent = "无法识别您的语音，请重试";
      };
      
      console.log('语音识别API初始化成功');
    } else {
      console.error('浏览器不支持语音识别API');
      this.statusDiv.textContent = "浏览器不支持语音识别";
    }
  }
  
  // 初始化方法
  init() {
    // 添加录音按钮点击事件
    this.micButton.addEventListener('click', () => this.toggleRecording());
    
    // 检查麦克风权限状态
    navigator.permissions.query({ name: 'microphone' })
      .then(permissionStatus => {
        console.log('麦克风权限状态:', permissionStatus.state);
        
        // 权限状态改变时的处理
        permissionStatus.onchange = () => {
          console.log('麦克风权限状态已更改:', permissionStatus.state);
        };
      });
  }
  
  // 切换录音状态
  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }
  
  // 开始录音
  startRecording() {
    if (!this.recognition) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }
    
    try {
      this.recognition.start();
      this.isRecording = true;
      
      // 更新UI状态
      this.micButton.classList.add('recording');
      this.statusDiv.textContent = "正在听您说话...";
      
      // 设置20秒超时，如果没有检测到语音
      this.recognitionTimeout = setTimeout(() => {
        console.log('语音识别超时');
        this.statusDiv.textContent = "识别超时，请重试";
        this.stopRecording();
      }, 20000);
      
      console.log('开始语音识别');
    } catch (error) {
      console.error('启动语音识别失败:', error);
      alert('无法启动语音识别，请检查浏览器权限设置');
    }
  }
  
  // 停止录音
  stopRecording() {
    // 取消超时定时器
    if (this.recognitionTimeout) {
      clearTimeout(this.recognitionTimeout);
      this.recognitionTimeout = null;
    }
    
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      
      // 更新UI状态
      this.micButton.classList.remove('recording');
      
      console.log('停止语音识别');
    }
  }
}

// 页面加载完成后初始化语音录制功能
document.addEventListener('DOMContentLoaded', () => {
  new VoiceRecorder();
}); 