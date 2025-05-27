// 定義摩斯密碼解碼結果的介面
interface MorseResult {
  morseCode: string;
  decodedText: string;
}

export class MorseDecoder {
  private static readonly MORSE_DICT: { [key: string]: string } = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
    '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
    '-----': '0', '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': "'",
    '-.-.--': '!', '-..-.': '/', '-.--.': '(', '-.--.-': ')', '.-...': '&',
    '---...': ':', '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-',
    '..--.-': '_', '.-..-.': '"', '...-..-': '$', '.--.-.': '@', '...---...': 'SOS'
  };

  // 反向摩斯密碼字典
  private static readonly REVERSE_MORSE_DICT: { [key: string]: string } = Object.entries(MorseDecoder.MORSE_DICT)
    .reduce((acc, [code, char]) => ({ ...acc, [char]: code }), {});

  // 音頻分析參數
  private static readonly DOT_LENGTH = 0.1; // 點的長度（秒）
  private static readonly DASH_LENGTH = 0.3; // 劃的長度（秒）
  private static readonly THRESHOLD = 0.1; // 音量閾值
  private static readonly SAMPLE_RATE = 44100; // 採樣率

  /**
   * 從 WAV 檔案解析摩斯密碼
   * @param audioBuffer 音頻數據
   * @returns 解析結果
   */
  public static async decodeFromAudio(audioBuffer: AudioBuffer): Promise<MorseResult> {
    const channelData = audioBuffer.getChannelData(0);
    
    // 分析音頻數據
    const signals = this.analyzeAudioSignals(channelData);
    const morseCode = this.signalsToMorseCode(signals);
    const decodedText = this.decodeMorseCode(morseCode);

    return {
      morseCode,
      decodedText
    };
  }

  /**
   * 分析音頻信號
   * @param audioData 音頻數據
   * @returns 信號序列（1表示有聲音，0表示靜音）
   */
  private static analyzeAudioSignals(audioData: Float32Array): number[] {
    const signals: number[] = [];
    const samplesPerAnalysis = Math.floor(this.DOT_LENGTH * this.SAMPLE_RATE);
    
    for (let i = 0; i < audioData.length; i += samplesPerAnalysis) {
      const slice = audioData.slice(i, i + samplesPerAnalysis);
      const volume = Math.max(...slice.map(Math.abs));
      signals.push(volume > this.THRESHOLD ? 1 : 0);
    }
    
    return signals;
  }

  /**
   * 將信號序列轉換為摩斯密碼
   * @param signals 信號序列
   * @returns 摩斯密碼字符串
   */
  private static signalsToMorseCode(signals: number[]): string {
    let morse = '';
    let count = 0;
    let lastSignal = 0;
    
    for (const signal of signals) {
      if (signal === lastSignal) {
        count++;
      } else {
        if (lastSignal === 1) {
          morse += count >= 3 ? '-' : '.';
        } else if (morse.length > 0) {
          morse += count >= 7 ? ' / ' : count >= 3 ? ' ' : '';
        }
        count = 1;
        lastSignal = signal;
      }
    }
    
    // 處理最後一個信號
    if (lastSignal === 1) {
      morse += count >= 3 ? '-' : '.';
    }
    
    return morse.trim();
  }

  /**
   * 解碼摩斯密碼
   * @param morseCode 摩斯密碼字符串
   * @returns 解碼後的文字
   */
  public static decodeMorseCode(morseCode: string): string {
    // 檢查輸入是否為空
    if (!morseCode || morseCode.trim().length === 0) {
      return '';
    }

    // 移除所有重複的標籤並提取內容
    let decodedContent = '';
    let morseContent = '';

    // 檢查是否為特殊的 flag 觸發序列
    const triggerSequences = [
      '... --- ... -.-. - ..-.', // SOS CTF
      '.... .. -.. -.. . -. ..-. .-.. .- --.', // HIDDEN FLAG
      '... . -.-. .-. . -', // SECRET
    ];

    // 清理輸入的摩斯密碼
    const cleanedMorseCode = morseCode.trim().replace(/\s+/g, ' ');

    // 檢查是否包含任何觸發序列
    for (const sequence of triggerSequences) {
      if (cleanedMorseCode.includes(sequence)) {
        const decodedSequence = sequence
          .split(' ')
          .map(code => this.MORSE_DICT[code] || '?')
          .join('');
        return `解密結果：${decodedSequence}\n摩斯密碼：${sequence}\n\n恭喜你發現了隱藏的 flag！\nNHISCCTF{M0rs3_D3c0d3r_Pr0}`;
      }
    }

    // 分割行並處理每一行
    const lines = morseCode.split('\n');
    for (const line of lines) {
      if (line.includes('解密結果：')) {
        // 提取解密結果內容，移除所有"解密結果："標籤
        const content = line.replace(/解密結果：/g, '').trim();
        decodedContent = content;
      } else if (line.includes('摩斯密碼：')) {
        // 提取摩斯密碼內容，移除所有"摩斯密碼："標籤
        const content = line.replace(/摩斯密碼：/g, '').trim();
        morseContent = content;
      }
    }

    // 如果沒有找到標籤內容，則將整個輸入作為摩斯密碼處理
    if (!decodedContent && !morseContent) {
      morseContent = morseCode.trim();
      // 清理輸入，移除多餘的空格
      morseContent = morseContent.replace(/\s+/g, ' ');

      // 解碼摩斯密碼
      decodedContent = morseContent
        .split(' / ')
        .map(word => 
          word.split(' ')
            .map(code => this.MORSE_DICT[code] || '?')
            .join('')
        )
        .join(' ');
    }

    // 返回標準格式
    return `解密結果：${decodedContent}\n摩斯密碼：${morseContent || morseCode.trim()}`;
  }

  /**
   * 從文字生成摩斯密碼
   * @param text 輸入文字
   * @returns 摩斯密碼字符串
   */
  public static textToMorse(text: string): string {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // 檢查輸入是否已經包含標籤
    if (text.includes('摩斯密碼：') || text.includes('解密結果：')) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('解密結果：')) {
          text = line.replace('解密結果：', '').trim();
          break;
        }
      }
    }

    return text.toUpperCase()
      .split('')
      .map(char => {
        if (char === ' ') return '/';
        return this.REVERSE_MORSE_DICT[char] || char;
      })
      .join(' ');
  }

  /**
   * 生成摩斯密碼的音頻
   * @param morseCode 摩斯密碼字符串
   * @returns 音頻 Buffer
   */
  public static async generateAudio(morseCode: string): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = this.SAMPLE_RATE;
    const frequency = 700; // Hz
    
    // 計算總長度
    let totalLength = 0;
    for (const char of morseCode) {
      switch (char) {
        case '.': totalLength += this.DOT_LENGTH; break;
        case '-': totalLength += this.DASH_LENGTH; break;
        case ' ': totalLength += this.DOT_LENGTH * 3; break;
        case '/': totalLength += this.DOT_LENGTH * 7; break;
      }
      totalLength += this.DOT_LENGTH; // 字符間隔
    }
    
    const samples = Math.ceil(totalLength * sampleRate);
    const buffer = audioContext.createBuffer(1, samples, sampleRate);
    const channel = buffer.getChannelData(0);
    
    let currentSample = 0;
    for (const char of morseCode) {
      const length = char === '.' ? this.DOT_LENGTH : 
                    char === '-' ? this.DASH_LENGTH :
                    char === ' ' ? this.DOT_LENGTH * 3 :
                    char === '/' ? this.DOT_LENGTH * 7 : 0;
                    
      if (length > 0) {
        const samples = Math.ceil(length * sampleRate);
        for (let i = 0; i < samples; i++) {
          if (char === '.' || char === '-') {
            channel[currentSample + i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
          }
        }
        currentSample += samples;
      }
      
      // 添加字符間隔
      currentSample += Math.ceil(this.DOT_LENGTH * sampleRate);
    }
    
    return buffer;
  }
}

export default MorseDecoder; 