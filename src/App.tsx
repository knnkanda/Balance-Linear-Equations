import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Info,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'

type Equation = {
  leftX: number
  leftConst: number
  rightX: number
  rightConst: number
}

type Level = 1 | 2 | 3
type Operation =
  | { kind: 'removeX'; amount: number }
  | { kind: 'removeConst'; amount: number }
  | { kind: 'addConst'; amount: number }
  | { kind: 'divide'; amount: number }

type Problem = {
  equation: Equation
  answer: number
  title: string
  description: string
}

const problems: Record<Level, Problem[]> = {
  1: [
    { equation: { leftX: 2, leftConst: 4, rightX: 0, rightConst: 10 }, answer: 3, title: 'まずは引き算から', description: '数字の分銅を両側から同じだけ取り除きます。' },
    { equation: { leftX: 3, leftConst: 3, rightX: 0, rightConst: 15 }, answer: 4, title: '天秤をつり合わせよう', description: '両側から同じ操作をすると、バランスは保たれます。' },
    { equation: { leftX: 2, leftConst: 6, rightX: 0, rightConst: 16 }, answer: 5, title: 'Xをひとりにしよう', description: '最後にX箱を1箱にすれば答えが見えてきます。' },
    { equation: { leftX: 4, leftConst: 4, rightX: 0, rightConst: 20 }, answer: 4, title: '分銅を見きわめよう', description: '数字の分銅を先に片づけると、Xが見えてきます。' },
    { equation: { leftX: 5, leftConst: 10, rightX: 0, rightConst: 30 }, answer: 4, title: 'LEVEL 1の仕上げ', description: '同じ操作を左右にすることを忘れずに。' },
  ],
  2: [
    { equation: { leftX: 4, leftConst: 8, rightX: 0, rightConst: 28 }, answer: 5, title: '大きな数にも挑戦', description: '分銅を消してから、X箱の数をそろえます。' },
    { equation: { leftX: 5, leftConst: 10, rightX: 0, rightConst: 35 }, answer: 5, title: '同じ操作を2回', description: '天秤の左右には、いつも同じ操作をします。' },
    { equation: { leftX: 3, leftConst: 9, rightX: 0, rightConst: 24 }, answer: 5, title: '焦らず一手ずつ', description: '見えている分銅から片づけていきましょう。' },
    { equation: { leftX: 4, leftConst: 12, rightX: 0, rightConst: 32 }, answer: 5, title: '少し大きな分銅', description: '数字が大きくなっても、やることは同じです。' },
    { equation: { leftX: 6, leftConst: 12, rightX: 0, rightConst: 48 }, answer: 6, title: 'LEVEL 2の仕上げ', description: 'X箱を1箱にする最後の一手まで進めましょう。' },
  ],
  3: [
    { equation: { leftX: 4, leftConst: 5, rightX: 1, rightConst: 20 }, answer: 5, title: 'X箱が両側に登場', description: 'まずX箱を片側に集めると、道筋が見えます。' },
    { equation: { leftX: 5, leftConst: 4, rightX: 2, rightConst: 19 }, answer: 5, title: 'Xをまとめよう', description: '少ない方のX箱を両側から取り除きます。' },
    { equation: { leftX: 6, leftConst: 6, rightX: 2, rightConst: 26 }, answer: 5, title: '仕上げの一問', description: '天秤が傾かないように、左右へ同じ操作を。' },
    { equation: { leftX: 7, leftConst: 7, rightX: 2, rightConst: 32 }, answer: 5, title: 'X箱をたくさん集める', description: 'まず少ない方のX箱を取り除きます。' },
    { equation: { leftX: 8, leftConst: 6, rightX: 3, rightConst: 31 }, answer: 5, title: 'LEVEL 3の仕上げ', description: 'X箱を集めて、数字の分銅を整理しましょう。' },
  ],
}

const levelCopy: Record<Level, { label: string; kicker: string; color: string }> = {
  1: { label: 'LEVEL 1', kicker: '基本のバランス', color: 'mint' },
  2: { label: 'LEVEL 2', kicker: '数字を整理', color: 'blue' },
  3: { label: 'LEVEL 3', kicker: 'Xを集める', color: 'purple' },
}

function formatTerm(coefficient: number, constant: number): string {
  const x = coefficient === 0 ? '' : coefficient === 1 ? 'x' : `${coefficient}x`
  if (constant === 0) return x || '0'
  if (!x) return `${constant}`
  return `${x} ${constant > 0 ? '+' : '−'} ${Math.abs(constant)}`
}

function getOperation(equation: Equation): Operation | null {
  if (equation.leftX > 0 && equation.rightX > 0 && equation.leftX !== equation.rightX) {
    return { kind: 'removeX', amount: Math.min(equation.leftX, equation.rightX) }
  }
  if (equation.leftX > 0 && equation.rightX === 0 && equation.leftConst !== 0) {
    return equation.leftConst > 0
      ? { kind: 'removeConst', amount: equation.leftConst }
      : { kind: 'addConst', amount: Math.abs(equation.leftConst) }
  }
  if (equation.rightX > 0 && equation.leftX === 0 && equation.rightConst !== 0) {
    return equation.rightConst > 0
      ? { kind: 'removeConst', amount: equation.rightConst }
      : { kind: 'addConst', amount: Math.abs(equation.rightConst) }
  }
  if (equation.leftX > 1 && equation.rightX === 0) return { kind: 'divide', amount: equation.leftX }
  if (equation.rightX > 1 && equation.leftX === 0) return { kind: 'divide', amount: equation.rightX }
  return null
}

function applyOperation(equation: Equation, operation: Operation): Equation {
  if (operation.kind === 'removeX') {
    return { ...equation, leftX: equation.leftX - operation.amount, rightX: equation.rightX - operation.amount }
  }
  if (operation.kind === 'removeConst') {
    return { ...equation, leftConst: equation.leftConst - operation.amount, rightConst: equation.rightConst - operation.amount }
  }
  if (operation.kind === 'addConst') {
    return { ...equation, leftConst: equation.leftConst + operation.amount, rightConst: equation.rightConst + operation.amount }
  }
  return {
    leftX: equation.leftX / operation.amount,
    leftConst: equation.leftConst / operation.amount,
    rightX: equation.rightX / operation.amount,
    rightConst: equation.rightConst / operation.amount,
  }
}

function operationLabel(operation: Operation | null): string {
  if (!operation) return '答えが見つかりました'
  if (operation.kind === 'removeX') return `両辺から ${operation.amount === 1 ? 'X箱を1つ' : `X箱を${operation.amount}つ`}取り除く`
  if (operation.kind === 'removeConst') return `両辺から ${operation.amount} を取り除く`
  if (operation.kind === 'addConst') return `両辺に ${operation.amount} を加える`
  return `両辺を ${operation.amount} で割る`
}

function termTokens(coefficient: number, constant: number) {
  const tokens: { label: string; type: 'x' | 'number' }[] = []
  for (let i = 0; i < coefficient; i += 1) tokens.push({ label: 'X', type: 'x' })
  if (constant !== 0) tokens.push({ label: `${constant}`, type: 'number' })
  if (tokens.length === 0) tokens.push({ label: '0', type: 'number' })
  return tokens
}

function BalancePan({ coefficient, constant, side }: { coefficient: number; constant: number; side: 'left' | 'right' }) {
  const tokens = termTokens(coefficient, constant)
  return (
    <div className={`pan-wrap ${side}`}>
      <div className="pan-string" />
      <div className="pan">
        <div className="pan-items">
          {tokens.map((token, index) => (
            <div className={`weight ${token.type}`} key={`${token.label}-${index}`}>
              {token.type === 'x' ? <><span className="weight-x">X</span><span className="weight-caption">箱</span></> : <span>{token.label}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [level, setLevel] = useState<Level>(1)
  const [problemIndex, setProblemIndex] = useState(0)
  const [equation, setEquation] = useState<Equation>(problems[1][0].equation)
  const [steps, setSteps] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [history, setHistory] = useState<Equation[]>([])

  const problem = problems[level][problemIndex]
  const operation = useMemo(() => getOperation(equation), [equation])
  const solved = operation === null
  const progress = solved ? 100 : Math.min((steps / 3) * 100, 100)
  const equationText = `${formatTerm(equation.leftX, equation.leftConst)} = ${formatTerm(equation.rightX, equation.rightConst)}`

  const selectLevel = (nextLevel: Level) => {
    setLevel(nextLevel)
    setProblemIndex(0)
    setEquation(problems[nextLevel][0].equation)
    setSteps(0)
    setHistory([])
    setShowHint(false)
    setShowSuccess(false)
  }

  const doOperation = () => {
    if (!operation || isApplying) return
    setIsApplying(true)
    window.setTimeout(() => {
      const nextEquation = applyOperation(equation, operation)
      setHistory((current) => [...current, equation])
      setEquation(nextEquation)
      setSteps((current) => current + 1)
      setShowHint(false)
      setIsApplying(false)
      if (getOperation(nextEquation) === null) setShowSuccess(true)
    }, 220)
  }

  const resetProblem = () => {
    setEquation(problem.equation)
    setSteps(0)
    setHistory([])
    setShowHint(false)
    setShowSuccess(false)
  }

  const goBack = () => {
    if (history.length === 0 || isApplying) return
    const previousEquation = history[history.length - 1]
    setEquation(previousEquation)
    setHistory((current) => current.slice(0, -1))
    setSteps((current) => Math.max(0, current - 1))
    setShowSuccess(false)
  }

  const nextProblem = () => {
    const nextIndex = (problemIndex + 1) % problems[level].length
    setProblemIndex(nextIndex)
    setEquation(problems[level][nextIndex].equation)
    setSteps(0)
    setHistory([])
    setShowHint(false)
    setShowSuccess(false)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><span /><span /><span /></div>
          <div><strong>Balance</strong><small>天秤で解ける一次方程式</small></div>
        </div>
        <div className="top-actions">
          <span className="streak"><Zap size={15} fill="currentColor" /> 3日連続</span>
          <button className="icon-button" aria-label="ゲームの説明"><Info size={19} /></button>
        </div>
      </header>

      <section className="game-layout">
        <aside className="level-sidebar">
          <div className="side-label">STAGES</div>
          <div className="level-list">
            {(Object.keys(levelCopy).map(Number) as Level[]).map((item) => (
              <button className={`level-button ${level === item ? 'active' : ''} ${levelCopy[item].color}`} onClick={() => selectLevel(item)} key={item}>
                <span className="level-number">0{item}</span>
                <span><b>{levelCopy[item].label}</b><small>{levelCopy[item].kicker}</small></span>
                {level === item && <ChevronRightIcon />}
              </button>
            ))}
          </div>
          <div className="side-note"><Sparkles size={16} /><span>説明を読まなくても<br />触ってわかる設計</span></div>
        </aside>

        <section className="game-content">
          <div className="mobile-stage-select">
            <label className="stage-select-button"><span>{levelCopy[level].label}</span><select aria-label="ステージを選ぶ" value={level} onChange={(event) => selectLevel(Number(event.target.value) as Level)}><option value="1">LEVEL 1</option><option value="2">LEVEL 2</option><option value="3">LEVEL 3</option></select><ChevronDown size={16} /></label>
          </div>

          <div className="game-heading">
            <div>
              <p className="eyebrow"><span className="live-dot" /> BALANCE THE EQUATION</p>
              <h1>天秤をつり合わせよう<span>。</span></h1>
              <p className="subheading">左右に同じ操作をして、Xをひとりにしてください。</p>
            </div>
            <div className="problem-count"><span>PROBLEM</span><b>{String(problemIndex + 1).padStart(2, '0')}</b><i>/ 05</i></div>
          </div>

          <div className={`equation-card ${isApplying ? 'shaking' : ''}`}>
            <div className="equation-label"><span>いまの式</span><span className="balanced-badge"><span className="balance-dot" /> BALANCED</span></div>
            <div className="equation-text" aria-live="polite">
              <span>{formatTerm(equation.leftX, equation.leftConst)}</span><b>=</b><span>{formatTerm(equation.rightX, equation.rightConst)}</span>
            </div>
            <div className="equation-progress"><span style={{ width: `${progress}%` }} /></div>
            <div className="step-caption">{solved ? 'Xの値が決まりました' : `ステップ ${steps + 1} / 3`}</div>
          </div>

          <div className="balance-card">
            <div className="balance-card-top"><span className="balance-title">THE BALANCE</span><span className="balance-state"><span className="balance-dot" /> つり合っています</span></div>
            <div className="balance-scene">
              <svg className="sketch-defs" aria-hidden="true" focusable="false">
                <defs>
                  <filter id="sketchy" x="-8%" y="-8%" width="116%" height="116%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
              </svg>
              <svg className="doodle-ink" viewBox="0 0 600 250" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path className="doodle-shadow" d="M177 105 C222 98 267 103 300 101 C338 99 380 102 425 105" />
                <path className="doodle-beam" d="M121 101 C181 97 239 99 300 100 C361 99 420 97 480 101" />
                <path className="doodle-beam-light" d="M126 105 C189 101 242 103 300 103 C360 102 414 101 476 105" />
                <path className="doodle-pan left" d="M84 133 C106 139 156 140 205 133 C194 158 176 170 144 171 C111 170 94 157 84 133Z" />
                <path className="doodle-pan right" d="M395 133 C443 140 494 139 516 133 C506 157 489 170 456 171 C424 170 406 158 395 133Z" />
                <path className="doodle-string" d="M113 37 C113 61 112 82 113 113 M487 37 C487 60 488 82 487 113" />
                <path className="doodle-pivot" d="M300 108 C293 137 289 165 283 194 C295 191 306 191 318 194 C311 164 307 137 300 108Z" />
                <path className="doodle-base" d="M232 208 C267 205 333 205 368 208 C366 216 361 220 354 220 C318 218 281 218 246 220 C239 220 234 216 232 208Z" />
              </svg>
              <div className="balance-glow" />
              <BalancePan coefficient={equation.leftX} constant={equation.leftConst} side="left" />
              <BalancePan coefficient={equation.rightX} constant={equation.rightConst} side="right" />
              <div className="beam"><span className="beam-cap left" /><span className="beam-cap right" /></div>
              <div className="balance-pivot"><span /></div>
              <div className="balance-face" aria-hidden="true"><span>•ᴗ•</span></div>
              <div className="balance-base" />
            </div>
            <div className="balance-legend"><span><i className="legend-x">X</i> Xの箱</span><span><i className="legend-number">3</i> 数字の分銅</span></div>
          </div>

          <div className="action-area">
            <div className="action-header"><div><span className="action-eyebrow">NEXT MOVE</span><h2>どの操作をする？</h2></div><button className="hint-button" onClick={() => setShowHint((current) => !current)}><Lightbulb size={17} /> ヒント</button></div>
            {showHint && !solved && <div className="hint-box"><Lightbulb size={17} /><span>{operationLabel(operation)}。<b>左右に同じことをする</b>のがコツです。</span></div>}
            <button className={`operation-button ${solved ? 'solved' : ''}`} onClick={doOperation} disabled={solved || isApplying}>
              <span className="operation-icon">{solved ? <Check size={22} /> : operation?.kind === 'divide' ? <span className="divide-symbol">÷</span> : operation?.kind === 'removeX' ? <X size={22} /> : operation?.kind === 'addConst' ? <Plus size={22} /> : <Minus size={22} />}</span>
              <span className="operation-copy"><small>{solved ? 'NICE WORK' : '両辺に同じ操作'}</small><strong>{operationLabel(operation)}</strong></span>
              {!solved && <ArrowRight className="operation-arrow" size={20} />}
            </button>
            {history.length > 0 && <div className="history-strip"><span className="history-title">手順</span>{history.map((item, index) => <span className="history-step" key={`${item.leftX}-${item.leftConst}-${index}`}>{formatTerm(item.leftX, item.leftConst)} = {formatTerm(item.rightX, item.rightConst)}</span>)}</div>}
            <div className="action-footer"><span><span className="tap-icon">↗</span> タップして操作</span><span className="footer-actions"><button onClick={goBack} disabled={history.length === 0}><ChevronLeft size={14} /> 一手戻る</button><button onClick={resetProblem}><RotateCcw size={14} /> 最初から</button></span></div>
          </div>
        </section>

        <aside className="insight-panel">
          <div className="insight-heading"><span className="insight-icon"><Sparkles size={17} /></span><div><span>YOUR PROGRESS</span><b>ひらめきメモ</b></div></div>
          <div className="insight-card"><div className="mini-equation"><span>{equationText}</span></div><p>{problem.description}</p><div className="rule-line"><span className="rule-number">01</span><span>天秤の左右に<br /><b>同じ操作</b>をする</span></div><div className="rule-line"><span className="rule-number">02</span><span>X箱を<br /><b>ひとりにする</b></span></div></div>
          <div className="score-card"><div><span>今日のスコア</span><b>{String(steps * 120).padStart(3, '0')}</b></div><div className="score-ring"><span>★</span></div></div>
          <button className="next-problem" onClick={nextProblem}>次の問題へ <ArrowRight size={17} /></button>
        </aside>
      </section>

      {showSuccess && <div className="success-toast"><div className="success-icon"><Check size={22} /></div><div><b>つり合った！</b><span>x = {problem.answer} です</span></div><button onClick={() => setShowSuccess(false)} aria-label="閉じる"><X size={16} /></button></div>}
    </main>
  )
}

function ChevronRightIcon() {
  return <ChevronLeft className="active-chevron" size={18} />
}

export default App
