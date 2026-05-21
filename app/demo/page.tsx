'use client';

import { useEffect, useRef, useState } from 'react';

type StreamName = 'Market Levy' | 'Business Permit' | 'Street Trading' | 'Signage Fee';

type Scene = {
  id: string;
  label: string;
  story: string;
  phone: 'scr-idle' | 'scr-login' | 'scr-col' | 'scr-ok' | 'scr-payer' | 'scr-fraud' | 'scr-impact';
  tag: string;
  login?: { phone: string };
  collect?: { who: string; where: string; amt: string; phone: string; chip: StreamName };
  rec?: { id: string; amt: string; type: StreamName; payer: string; time: string; sms: string };
  payerSms?: { from: string; carrier: string; body: string; when: string };
  flag?: { agent: string; type: StreamName; amt: string };
  d: {
    tot: string; mon: string; ag: string; fl: string;
    fnote: string; tnote: string; mnote: string; agnote: string;
    warn: boolean;
  };
  anomaly: boolean;
  chart: boolean;
  rank: boolean;
  feed: { ok: boolean; who: string; what: string; amt: string; when: string }[];
};

const SCENES: Scene[] = [
  {
    id: 'Scene I', label: 'The problem',
    story: 'A field agent collects <strong>₦180,000</strong> from market traders. He remits <strong>₦40,000</strong> to the state treasury. The remaining ₦140,000 vanishes — no receipt, no trail, no proof. Across 21 Nigerian states, this happens every single day. Revo is the revenue intelligence platform that ends it.',
    phone: 'scr-idle', tag: '—',
    d: { tot: '₦0', mon: '₦0', ag: '0', fl: '0', fnote: 'All clear', tnote: 'No collections yet', mnote: 'Month to date', agnote: 'of 3 on roster', warn: false },
    anomaly: false, chart: false, rank: false, feed: [],
  },
  {
    id: 'Scene II', label: 'Agent signs in',
    story: 'Agent <strong>Fatima Yusuf</strong> opens Revo on her Android. She enters her <strong>phone number</strong> and her <strong>4-digit PIN</strong>. The server authenticates her and links every collection she records to her agent ID. No cash changes hands without a permanent digital record.',
    phone: 'scr-login', tag: '—',
    login: { phone: '08012345672' },
    d: { tot: '₦0', mon: '₦0', ag: '0', fl: '0', fnote: 'All clear', tnote: 'No collections yet', mnote: 'Month to date', agnote: 'of 3 on roster', warn: false },
    anomaly: false, chart: false, rank: false, feed: [],
  },
  {
    id: 'Scene III', label: 'Collection in progress',
    story: 'A trader pays a ₦2,000 levy. Fatima selects the <strong>revenue type</strong>, types the amount, enters the payer&rsquo;s phone number, and taps <strong>Confirm and record collection</strong>. In that instant: recorded in the ledger, a tamper-proof receipt generated, and an SMS dispatched <strong>directly</strong> to the trader — bypassing the agent.',
    phone: 'scr-col', tag: 'FY',
    collect: { who: 'Collection details', where: 'Agent · Fatima Yusuf', amt: '2,000', phone: '08012345678', chip: 'Market Levy' },
    d: { tot: '₦0', mon: '₦0', ag: '1', fl: '0', fnote: 'All clear', tnote: 'Agent active', mnote: 'Month to date', agnote: 'of 3 on roster', warn: false },
    anomaly: false, chart: false, rank: false, feed: [],
  },
  {
    id: 'Scene IV', label: 'SMS receipt & live dashboard',
    story: 'The trader receives an SMS from <strong>Revo</strong> — not from the agent, directly from the platform. If Fatima had recorded ₦0 and pocketed the cash, that SMS would prove the discrepancy. The commissioner&rsquo;s dashboard updates in real time: every naira, every agent.',
    phone: 'scr-ok', tag: 'FY',
    rec: {
      id: 'A3F2B91C', amt: '₦2,000', type: 'Market Levy', payer: '08012345678', time: '09:41 AM',
      sms: 'Revo: Payment of N2,000 for Market Levy received. Receipt ID: A3F2B91C. Keep this as proof of payment.',
    },
    d: { tot: '₦127,500', mon: '₦4,210,000', ag: '3', fl: '0', fnote: 'All clear', tnote: '12 transactions today', mnote: 'Month to date', agnote: 'of 3 on roster', warn: false },
    anomaly: false, chart: true, rank: false,
    feed: [
      { ok: true, who: 'Fatima Yusuf', what: 'Market Levy · A3F2B91C', amt: '₦2,000', when: '09:41' },
      { ok: true, who: 'Emeka Obi', what: 'Business Permit · 8B41C2D9', amt: '₦18,000', when: '09:38' },
      { ok: true, who: 'Chidi Nwosu', what: 'Street Trading · 27EA9F3B', amt: '₦3,500', when: '09:35' },
      { ok: true, who: 'Fatima Yusuf', what: 'Signage Fee · 5C9D7A11', amt: '₦12,000', when: '09:29' },
    ],
  },
  {
    id: 'Scene V', label: 'Payer receives SMS',
    story: 'A few seconds later, the trader&rsquo;s phone buzzes. <strong>Revo</strong> — the platform, not the agent — has sent her an SMS receipt with the amount, the revenue type, and a tamper-proof Receipt ID. She now holds proof of payment she can show anyone. The trail is permanent and out of the agent&rsquo;s hands.',
    phone: 'scr-payer', tag: '',
    payerSms: {
      from: 'Revo',
      carrier: 'MTN NG',
      body: 'Revo: Payment of N2,000 for Market Levy received. Receipt ID: A3F2B91C. Keep this as proof of payment.',
      when: '09:41 AM',
    },
    d: { tot: '₦127,500', mon: '₦4,210,000', ag: '3', fl: '0', fnote: 'All clear', tnote: '12 transactions today', mnote: 'Month to date', agnote: 'of 3 on roster', warn: false },
    anomaly: false, chart: true, rank: false,
    feed: [
      { ok: true, who: 'Fatima Yusuf', what: 'Market Levy · A3F2B91C', amt: '₦2,000', when: '09:41' },
      { ok: true, who: 'Emeka Obi', what: 'Business Permit · 8B41C2D9', amt: '₦18,000', when: '09:38' },
      { ok: true, who: 'Chidi Nwosu', what: 'Street Trading · 27EA9F3B', amt: '₦3,500', when: '09:35' },
      { ok: true, who: 'Fatima Yusuf', what: 'Signage Fee · 5C9D7A11', amt: '₦12,000', when: '09:29' },
    ],
  },
  {
    id: 'Scene VI', label: 'Anomaly flagged',
    story: 'Agent <strong>Chidi Nwosu</strong> records a <strong>₦75,000</strong> business-permit collection. Revo&rsquo;s rule is deterministic: any collection at or above <strong>₦50,000</strong> is held for manual review. No waiting for month-end audit — the commissioner sees it on the dashboard the moment it lands.',
    phone: 'scr-fraud', tag: 'CN',
    flag: { agent: 'Chidi Nwosu', type: 'Business Permit', amt: '₦75,000' },
    d: { tot: '₦202,500', mon: '₦4,285,000', ag: '3', fl: '1', fnote: 'Needs review', tnote: '13 transactions today', mnote: 'Month to date', agnote: 'of 3 on roster', warn: true },
    anomaly: true, chart: true, rank: true,
    feed: [
      { ok: false, who: 'Chidi Nwosu', what: 'Business Permit · F71C04A8 ⚠', amt: '₦75,000', when: '10:14' },
      { ok: true, who: 'Fatima Yusuf', what: 'Market Levy · A3F2B91C', amt: '₦2,000', when: '09:41' },
      { ok: true, who: 'Emeka Obi', what: 'Business Permit · 8B41C2D9', amt: '₦18,000', when: '09:38' },
      { ok: true, who: 'Chidi Nwosu', what: 'Street Trading · 27EA9F3B', amt: '₦3,500', when: '09:35' },
    ],
  },
  {
    id: 'Scene VII', label: 'The impact',
    story: 'A 30% improvement in a state&rsquo;s IGR recovers <strong>₦9 billion annually</strong> — from money already being collected, just never reaching the treasury. Revo is not a payment app. It is the governance infrastructure through which Nigerian states collect what they are already owed — and citizens finally see their levies build the services they deserve.',
    phone: 'scr-impact', tag: '—',
    d: { tot: '₦202,500', mon: '₦4,285,000', ag: '3', fl: '1', fnote: '1 under review', tnote: '13 transactions · full audit trail', mnote: 'Month to date', agnote: 'of 3 on roster', warn: true },
    anomaly: true, chart: true, rank: false,
    feed: [
      { ok: false, who: 'Chidi Nwosu', what: 'Business Permit · under review', amt: '₦75,000', when: '10:14' },
      { ok: true, who: 'Fatima Yusuf', what: 'Market Levy · A3F2B91C', amt: '₦2,000', when: '09:41' },
      { ok: true, who: 'Emeka Obi', what: 'Business Permit · 8B41C2D9', amt: '₦18,000', when: '09:38' },
      { ok: true, who: 'Chidi Nwosu', what: 'Street Trading · 27EA9F3B', amt: '₦3,500', when: '09:35' },
    ],
  },
];

const HOURS = ['07', '08', '09', '10', '11', '12'];
const CHART_VALS = [42000, 118000, 210000, 185000, 167000, 125000];
const CHART_MAX = Math.max(...CHART_VALS);
const CHART_COLORS = ['#0C7A55', '#0C7A55', '#0C7A55', '#8C5E00', '#0C7A55', '#0C7A55'];

const SPEEDS = [1, 1.5, 0.6];
const SPD_LBLS = ['1× speed', '1.5× speed', '0.5× speed'];
const DURS = [8500, 7500, 9000, 9500, 8500, 10000, 11000];

const RANK_ROWS = [
  { rank: 1, name: 'Emeka Obi', pct: 100, color: 'var(--emerald)', amt: '₦94,000', flagged: false },
  { rank: 2, name: 'Fatima Yusuf', pct: 53, color: 'var(--emerald)', amt: '₦50,000', flagged: false },
  { rank: 3, name: 'Chidi Nwosu', pct: 86, color: 'var(--crimson)', amt: '₦81,500', flagged: true },
];

export default function DemoPage() {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);

  const [pinDots, setPinDots] = useState<boolean[]>([false, false, false, false]);
  const [loginPhoneStr, setLoginPhoneStr] = useState('');
  const [loginBtnPressed, setLoginBtnPressed] = useState(false);
  const [amountStr, setAmountStr] = useState('0');
  const [amountActive, setAmountActive] = useState(false);
  const [phoneStr, setPhoneStr] = useState('');
  const [btnPressed, setBtnPressed] = useState(false);
  const [barPcts, setBarPcts] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const [flashTot, setFlashTot] = useState(false);
  const [flashMon, setFlashMon] = useState(false);
  const [flashAg, setFlashAg] = useState(false);
  const [flashFl, setFlashFl] = useState(false);

  const prevDRef = useRef<Scene['d'] | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const s = SCENES[cur];

    setPinDots([false, false, false, false]);
    setLoginPhoneStr('');
    setLoginBtnPressed(false);
    setAmountStr('0');
    setAmountActive(false);
    setPhoneStr('');
    setBtnPressed(false);
    setBarPcts([0, 0, 0, 0, 0, 0]);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    if (s.phone === 'scr-login' && s.login) {
      const phone = s.login.phone;
      let built = '';
      let idx = 0;
      const typePhoneStep = () => {
        if (idx < phone.length) {
          built += phone[idx++];
          setLoginPhoneStr(built);
          timeouts.push(setTimeout(typePhoneStep, 60 + Math.random() * 60));
        } else {
          timeouts.push(setTimeout(startPin, 500));
        }
      };
      let pinStep = 0;
      const startPin = () => {
        const interval = setInterval(() => {
          if (pinStep < 4) {
            const cap = pinStep;
            setPinDots(prev => {
              const next = [...prev];
              next[cap] = true;
              return next;
            });
            pinStep++;
          } else {
            clearInterval(interval);
            timeouts.push(setTimeout(() => {
              setLoginBtnPressed(true);
              timeouts.push(setTimeout(() => setLoginBtnPressed(false), 300));
            }, 400));
          }
        }, 280);
        intervals.push(interval);
      };
      timeouts.push(setTimeout(typePhoneStep, 500));
    }

    if (s.phone === 'scr-col' && s.collect) {
      const c = s.collect;
      const digits = c.amt.replace(/,/g, '').split('');

      const typePhoneStep = () => {
        let built = '';
        let idx = 0;
        const step = () => {
          if (idx < c.phone.length) {
            built += c.phone[idx++];
            setPhoneStr(built);
            timeouts.push(setTimeout(step, 60 + Math.random() * 60));
          } else {
            timeouts.push(setTimeout(() => {
              setBtnPressed(true);
              timeouts.push(setTimeout(() => setBtnPressed(false), 300));
            }, 800));
          }
        };
        step();
      };

      const typeAmtStep = () => {
        let built = '';
        let idx = 0;
        const step = () => {
          if (idx < digits.length) {
            built += digits[idx++];
            setAmountStr(parseInt(built, 10).toLocaleString());
            timeouts.push(setTimeout(step, 120 + Math.random() * 80));
          } else {
            timeouts.push(setTimeout(() => {
              setAmountActive(true);
              timeouts.push(setTimeout(typePhoneStep, 400));
            }, 300));
          }
        };
        step();
      };

      timeouts.push(setTimeout(typeAmtStep, 600));
    }

    if (s.chart) {
      timeouts.push(setTimeout(() => {
        setBarPcts(CHART_VALS.map(v => Math.round((v / CHART_MAX) * 100)));
      }, 80));
    }

    const prevD = prevDRef.current;
    const tFlash = !!prevD && prevD.tot !== s.d.tot;
    const mFlash = !!prevD && prevD.mon !== s.d.mon;
    const aFlash = !!prevD && prevD.ag !== s.d.ag;
    const fFlash = !!prevD && prevD.fl !== s.d.fl;
    if (tFlash) {
      setFlashTot(false);
      timeouts.push(setTimeout(() => setFlashTot(true), 20));
    }
    if (mFlash) {
      setFlashMon(false);
      timeouts.push(setTimeout(() => setFlashMon(true), 20));
    }
    if (aFlash) {
      setFlashAg(false);
      timeouts.push(setTimeout(() => setFlashAg(true), 20));
    }
    if (fFlash) {
      setFlashFl(false);
      timeouts.push(setTimeout(() => setFlashFl(true), 20));
    }
    prevDRef.current = s.d;

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      intervals.forEach(i => clearInterval(i));
    };
  }, [cur]);

  useEffect(() => {
    if (!playing) return;
    if (cur >= SCENES.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      setCur(c => c + 1);
    }, DURS[cur] / SPEEDS[speedIdx]);
    return () => clearTimeout(t);
  }, [playing, cur, speedIdx]);

  const next = () => setCur(c => Math.min(c + 1, SCENES.length - 1));
  const prev = () => setCur(c => Math.max(c - 1, 0));
  const togglePlay = () => setPlaying(p => !p);
  const cycleSpd = () => setSpeedIdx(i => (i + 1) % 3);

  const s = SCENES[cur];
  const progPct = (cur / (SCENES.length - 1)) * 100;

  return (
    <div className="revo-demo">
      <style>{CSS}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&display=swap"
      />

      <header className="topbar">
        <div className="logo">
          <span className="logo-word">REVO</span>
          <div className="logo-dot" />
          <span className="logo-tag">
            Smart Challenge 2026 &nbsp;·&nbsp; GovTech Category &nbsp;·&nbsp; Covenant University
          </span>
        </div>
        <div className="pips">
          {SCENES.map((_, j) => (
            <div
              key={j}
              className={'pip' + (j === cur ? ' active' : j < cur ? ' done' : '')}
            />
          ))}
          <span className="pip-ct">
            {String(cur + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
          </span>
        </div>
      </header>

      <div className="storybar">
        <div className="s-label">{s.id}</div>
        <div className="s-sep" />
        <div className="s-text" dangerouslySetInnerHTML={{ __html: s.story }} />
      </div>

      <main className="arena">
        <div className="lane left">
          <div className="lane-lbl">◈ &nbsp;Agent view · Field collection app</div>
          <div className="phone-stage">
            <div className="phone">
              {s.phone === 'scr-payer' && s.payerSms ? (
                <div className="ph-bar ph-bar-payer">
                  <span className="ph-carrier">{s.payerSms.carrier}</span>
                  <span className="ph-clock">{s.payerSms.when}</span>
                  <span className="ph-icons">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                      <rect x="0" y="6" width="1.6" height="2" fill="currentColor" />
                      <rect x="2.4" y="4" width="1.6" height="4" fill="currentColor" />
                      <rect x="4.8" y="2" width="1.6" height="6" fill="currentColor" />
                      <rect x="7.2" y="0" width="1.6" height="8" fill="currentColor" />
                    </svg>
                    <svg width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden>
                      <rect x="0.5" y="0.5" width="11" height="6" rx="1" stroke="currentColor" />
                      <rect x="2" y="2" width="8" height="3" fill="currentColor" />
                      <rect x="12" y="2" width="1.5" height="3" fill="currentColor" />
                    </svg>
                  </span>
                </div>
              ) : (
                <div className="ph-bar">
                  <div className="ph-brand">REVO</div>
                  <div className="ph-id">{s.tag}</div>
                </div>
              )}
              <div className="ph-body">
                {s.phone === 'scr-idle' && (
                  <div className="scr on">
                    <div className="idle">
                      <div className="idle-logo">REVO</div>
                      <div className="idle-state">Revenue intelligence platform</div>
                      <div className="idle-rule" />
                      <div className="idle-tag">
                        Every naira collected.<br />Every naira accounted for.
                      </div>
                    </div>
                  </div>
                )}

                {s.phone === 'scr-login' && (
                  <div className="scr on">
                    <div className="login-head">Sign in</div>
                    <div className="login-sub">Access your collection portal</div>
                    <div className="f-lbl">Phone number</div>
                    <input
                      className="t-field login-phone"
                      value={loginPhoneStr}
                      readOnly
                      placeholder="08XXXXXXXXX"
                    />
                    <div className="f-lbl">4-digit PIN</div>
                    <div className="pin-boxes">
                      {pinDots.map((on, i) => (
                        <div key={i} className={'pb' + (on ? ' on' : '')}>
                          {on && <div className="pb-dot" />}
                        </div>
                      ))}
                    </div>
                    <button className={'go-btn' + (loginBtnPressed ? ' pressed' : '')}>
                      Sign in
                    </button>
                  </div>
                )}

                {s.phone === 'scr-col' && s.collect && (
                  <div className="scr on">
                    <div className="col-hd">
                      <div className="col-who">{s.collect.who}</div>
                      <div className="col-where">{s.collect.where}</div>
                    </div>
                    <div className="f-lbl">Revenue type</div>
                    <div className="chips">
                      {(['Market Levy', 'Business Permit', 'Street Trading', 'Signage Fee'] as const).map(name => (
                        <div
                          key={name}
                          className={'chip' + (s.collect!.chip === name ? ' sel' : '')}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                    <div className="f-lbl">Amount (₦)</div>
                    <div className={'amt-box' + (amountActive ? ' active' : '')}>
                      <span className="amt-sym">₦</span>
                      <span className="amt-num">{amountStr}</span>
                      <span className="amt-cursor" />
                    </div>
                    <div className="f-lbl">Payer phone</div>
                    <input className="t-field" value={phoneStr} readOnly placeholder="08XXXXXXXXX" />
                    <button className={'go-btn' + (btnPressed ? ' pressed' : '')}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <polyline
                          points="1,5.5 4.5,9 10,2"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Confirm and record collection
                    </button>
                  </div>
                )}

                {s.phone === 'scr-ok' && s.rec && (
                  <div className="scr on">
                    <div className="suc">
                      <div className="suc-ring">
                        <svg className="suc-svg" viewBox="0 0 24 24">
                          <polyline points="4,12 9,17 20,6" />
                        </svg>
                      </div>
                      <div className="suc-title">Collection recorded</div>
                      <div className="suc-sub">SMS sent to taxpayer · {s.rec.time}</div>
                      <div className="sms-card">
                        <div className="sms-from">REVO</div>
                        <div className="sms-msg">{s.rec.sms}</div>
                      </div>
                      <div className="receipt-id-block">
                        <div className="receipt-id-lbl">Receipt ID</div>
                        <div className="receipt-id-val">{s.rec.id}</div>
                      </div>
                      <div className="rcpt">
                        <div className="rr"><span className="rl">Amount</span><span className="rv" style={{ color: 'var(--gold)' }}>{s.rec.amt}</span></div>
                        <div className="rr"><span className="rl">Type</span><span className="rv">{s.rec.type}</span></div>
                        <div className="rr"><span className="rl">Payer</span><span className="rv">{s.rec.payer}</span></div>
                        <div className="rr"><span className="rl">Status</span><span className="rv" style={{ color: 'var(--emerald)' }}>Synced</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {s.phone === 'scr-payer' && s.payerSms && (
                  <div className="scr on payer-scr">
                    <div className="payer-app-bar">
                      <div className="payer-app-back">‹</div>
                      <div className="payer-app-name">Messages</div>
                      <div className="payer-app-info">⋯</div>
                    </div>
                    <div className="payer-contact">
                      <div className="payer-avatar">RG</div>
                      <div className="payer-from">{s.payerSms.from}</div>
                      <div className="payer-num">SMS · short code</div>
                    </div>
                    <div className="payer-time-divider">Today · {s.payerSms.when}</div>
                    <div className="payer-msg-bubble">{s.payerSms.body}</div>
                    <div className="payer-msg-status">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
                        <polyline points="1,5 3.5,7.5 8,2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Delivered
                    </div>
                  </div>
                )}

                {s.phone === 'scr-fraud' && s.flag && (
                  <div className="scr on">
                    <div className="fraud">
                      <div className="fraud-ring">⚠</div>
                      <div className="fraud-name">Held for review</div>
                      <div className="fraud-id">Receipt F71C04A8</div>
                    </div>
                    <div className="rcpt" style={{ marginBottom: 8 }}>
                      <div className="rr"><span className="rl">Agent</span><span className="rv">{s.flag.agent}</span></div>
                      <div className="rr"><span className="rl">Revenue type</span><span className="rv">{s.flag.type}</span></div>
                      <div className="rr"><span className="rl">Amount</span><span className="rv" style={{ color: 'var(--crimson)' }}>{s.flag.amt}</span></div>
                      <div className="rr"><span className="rl">Threshold</span><span className="rv">₦50,000</span></div>
                      <div className="rr"><span className="rl">Status</span><span className="rv" style={{ color: 'var(--amber)' }}>Pending review</span></div>
                    </div>
                    <div className="fraud-alert">
                      Collections of ₦50,000 or more are held for manual review. The commissioner has been notified.
                    </div>
                  </div>
                )}

                {s.phone === 'scr-impact' && (
                  <div className="scr on">
                    <div className="imp-hed">₦9 billion recovered annually enables:</div>
                    <div className="imp-cards">
                      <div className="imp-card e">
                        <div className="imp-ico">📚</div>
                        <div>
                          <div className="imp-big">15,000 teachers</div>
                          <div className="imp-sm">Primary schools staffed, SDG 4</div>
                        </div>
                      </div>
                      <div className="imp-card s">
                        <div className="imp-ico">🏥</div>
                        <div>
                          <div className="imp-big">180 health centres</div>
                          <div className="imp-sm">Rehabilitated at ₦50M each, SDG 3</div>
                        </div>
                      </div>
                      <div className="imp-card a">
                        <div className="imp-ico">🛣️</div>
                        <div>
                          <div className="imp-big">90 km of roads</div>
                          <div className="imp-sm">Rural access, ₦100M per km, SDG 9</div>
                        </div>
                      </div>
                    </div>
                    <div className="imp-foot">
                      From money already being collected —<br />just never reaching the treasury.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lane right">
          <div className="lane-lbl">◈ &nbsp;Commissioner view · State revenue intelligence</div>
          <div className="dash">
            <div className="dash-hd">
              <div>
                <div className="dash-title">Revenue intelligence platform</div>
                <div className="dash-sub">State admin dashboard · Thursday, 21 May 2026</div>
              </div>
              <div className="live-chip"><div className="live-dot" />Live</div>
            </div>

            <div className="mets">
              <div className={'mc' + (flashTot ? ' flash' : '')}>
                <div className="mc-lbl">Collected today</div>
                <div className="mc-val">{s.d.tot}</div>
                <div className="mc-note pos">{s.d.tnote}</div>
              </div>
              <div className={'mc' + (flashMon ? ' flash' : '')}>
                <div className="mc-lbl">This month</div>
                <div className="mc-val">{s.d.mon}</div>
                <div className="mc-note">{s.d.mnote}</div>
              </div>
              <div className={'mc' + (flashAg ? ' flash' : '')}>
                <div className="mc-lbl">Active agents</div>
                <div className="mc-val">
                  {s.d.ag}
                  <span style={{ fontSize: 14, color: 'var(--ink-ghost)', fontWeight: 400 }}> /3</span>
                </div>
                <div className="mc-note">{s.d.agnote}</div>
              </div>
              <div className={'mc' + (flashFl ? ' flash' : '')}>
                <div className="mc-lbl">Open flags</div>
                <div className={'mc-val' + (s.d.warn ? ' warn' : '')}>{s.d.fl}</div>
                <div className={'mc-note' + (s.d.warn ? ' neg' : '')}>{s.d.fnote}</div>
              </div>
            </div>

            {s.chart && (
              <div className="chart-wrap">
                <div className="chart-hd">
                  <span className="chart-title">Today by hour</span>
                  <span className="chart-total">{s.d.tot}</span>
                </div>
                <div className="bars">
                  {HOURS.map((h, i) => (
                    <div className="bar-col" key={h}>
                      <div
                        className="bar-fill"
                        style={{ height: barPcts[i] + '%', background: CHART_COLORS[i] }}
                      />
                      <div className="bar-lbl">{h}h</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {s.anomaly && (
              <div className="alert-card show">
                <div className="al-ico">⚠</div>
                <div>
                  <div className="al-title">{s.d.fl} anomaly flag{s.d.fl === '1' ? '' : 's'} require{s.d.fl === '1' ? 's' : ''} review</div>
                  <div className="al-body">
                    Collections of ₦50,000 or more are held for manual review.
                    Chidi Nwosu just recorded a ₦75,000 Business Permit collection — pending commissioner approval.
                  </div>
                </div>
              </div>
            )}

            {s.rank && (
              <div className="rank-wrap show">
                <div className="rank-row" style={{ background: 'var(--canvas2)' }}>
                  <span
                    className="rank-num"
                    style={{
                      color: 'var(--ink-faint)', fontSize: 8, fontWeight: 700,
                      letterSpacing: '0.1em', width: 'auto', fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    AGENTS · COLLECTIONS TODAY
                  </span>
                </div>
                {RANK_ROWS.map(r => (
                  <div key={r.rank} className={'rank-row' + (r.flagged ? ' flagged' : '')}>
                    <span className="rank-num">{r.rank}</span>
                    <span className="rank-name">{r.name}</span>
                    <div className="rank-bar-wrap">
                      <div className="rank-bar-fill" style={{ width: r.pct + '%', background: r.color }} />
                    </div>
                    <span
                      className="rank-amt"
                      style={r.flagged ? { color: 'var(--crimson)' } : undefined}
                    >
                      {r.amt}
                    </span>
                    {r.flagged && <span className="rank-flag">⚠</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="sec-hd">
              <span className="sec-title">Transaction feed</span>
              <span className="sec-ct">{s.feed.length > 0 ? 'Latest ' + s.feed.length : '—'}</span>
            </div>
            <div className="feed-wrap">
              {s.feed.length === 0 ? (
                <div className="feed-empty">Awaiting first collections…</div>
              ) : (
                s.feed.map((t, i) => (
                  <div className="txn" key={i}>
                    <div className={'txn-dot ' + (t.ok ? 'ok' : 'fl')} />
                    <div className="txn-info">
                      <div className="txn-who">{t.who}</div>
                      <div className="txn-what">{t.what}</div>
                    </div>
                    <div className="txn-amt">{t.amt}</div>
                    <div className="txn-when">{t.when}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <nav className="ctrl">
        <button className="cb cb-ghost" onClick={prev} disabled={cur === 0}>← Prev</button>
        <div className="prog-rail"><div className="prog-fill" style={{ width: progPct + '%' }} /></div>
        <button className="cb cb-primary" onClick={togglePlay}>
          {playing ? '⏸  Pause' : '▶  Auto-play'}
        </button>
        <div className="prog-rail"><div className="prog-fill" style={{ width: progPct + '%' }} /></div>
        <button className="cb cb-ghost" onClick={next} disabled={cur === SCENES.length - 1}>Next →</button>
        <button className="spd-btn" onClick={cycleSpd}>{SPD_LBLS[speedIdx]}</button>
      </nav>
    </div>
  );
}

const CSS = `
.revo-demo, .revo-demo *, .revo-demo *::before, .revo-demo *::after { box-sizing: border-box; margin: 0; padding: 0; }
.revo-demo {
  --canvas:#F7F6F2; --canvas2:#EEECEA; --white:#FFFFFF;
  --ink:#0D1B2A; --ink2:#1C2F45; --ink3:#2C3E50;
  --ink-soft:#4A5568; --ink-faint:#8492A6; --ink-ghost:#B8C4D0;
  --gold:#B8973A; --gold2:#D4AE54; --gold-light:#FBF5E6; --gold-line:rgba(184,151,58,0.18);
  --emerald:#0C7A55; --em-bg:#E6F5F0; --em-line:#A8D5C5;
  --amber:#8C5E00; --am-bg:#FDF3DC; --am-line:#E8C96A;
  --crimson:#8B1D1D; --cr-bg:#FBEAEA; --cr-line:#DBA8A8;
  --sapphire:#0E4D8A; --sa-bg:#E8F2FC; --sa-line:#A8C8F0;
  --border:#E2DDD6; --border2:#D0CAC0;
  position: fixed; inset: 0;
  font-family: 'Inter', sans-serif;
  background: var(--canvas);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

.revo-demo .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 400; height: 52px; background: var(--ink); display: flex; align-items: center; justify-content: space-between; padding: 0 22px; }
.revo-demo .logo { display: flex; align-items: center; }
.revo-demo .logo-word { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; letter-spacing: 3px; }
.revo-demo .logo-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold2); margin: 0 3px 1px; }
.revo-demo .logo-tag { font-size: 9px; font-weight: 500; letter-spacing: 0.13em; color: rgba(255,255,255,0.32); text-transform: uppercase; margin-left: 14px; padding-left: 14px; border-left: 1px solid rgba(255,255,255,0.1); }
.revo-demo .pips { display: flex; align-items: center; gap: 7px; }
.revo-demo .pip { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.14); transition: all 0.35s cubic-bezier(.4,0,.2,1); width: 22px; }
.revo-demo .pip.done { background: rgba(184,151,58,0.45); }
.revo-demo .pip.active { background: var(--gold2); width: 34px; }
.revo-demo .pip-ct { font-size: 9.5px; color: rgba(255,255,255,0.3); font-family: 'JetBrains Mono', monospace; margin-left: 5px; letter-spacing: 0.05em; }

.revo-demo .storybar { position: fixed; top: 52px; left: 0; right: 0; z-index: 399; height: 70px; background: var(--ink2); border-bottom: 1.5px solid var(--gold-line); display: flex; align-items: center; padding: 0 22px; gap: 16px; overflow: hidden; }
.revo-demo .s-label { font-family: 'Playfair Display', serif; font-style: italic; font-size: 10.5px; font-weight: 500; color: var(--gold2); letter-spacing: 0.07em; white-space: nowrap; flex-shrink: 0; text-transform: uppercase; }
.revo-demo .s-sep { width: 1px; height: 26px; background: rgba(255,255,255,0.09); flex-shrink: 0; }
.revo-demo .s-text { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.5; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.revo-demo .s-text strong { font-weight: 600; color: rgba(255,255,255,0.95); }

.revo-demo .arena { position: fixed; top: 122px; bottom: 62px; left: 0; right: 0; display: grid; grid-template-columns: 1fr 1.2fr; }
.revo-demo .lane { display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.revo-demo .lane.left { background: var(--ink); border-right: 1px solid rgba(255,255,255,0.05); }
.revo-demo .lane.right { background: var(--canvas); }
.revo-demo .lane-lbl { flex-shrink: 0; padding: 9px 18px 0; font-size: 8.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
.revo-demo .lane.left .lane-lbl { color: rgba(255,255,255,0.2); }
.revo-demo .lane.right .lane-lbl { color: var(--ink-ghost); }

.revo-demo .phone-stage { flex: 1; display: flex; justify-content: center; align-items: center; padding: 10px 22px 18px; min-height: 0; overflow: hidden; }
.revo-demo .phone { width: 238px; background: var(--white); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 0 0 5px rgba(255,255,255,0.03), 0 28px 72px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.25); }
.revo-demo .ph-bar { background: var(--ink); padding: 10px 15px 8px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
.revo-demo .ph-brand { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; letter-spacing: 3px; color: var(--gold2); }
.revo-demo .ph-id { font-size: 8px; color: rgba(255,255,255,0.28); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.07em; }
.revo-demo .ph-body { background: var(--white); padding: 13px; min-height: 330px; }
.revo-demo .scr { animation: scr-in 0.28s ease both; }
@keyframes scr-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.revo-demo .idle { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 38px 0 30px; text-align: center; }
.revo-demo .idle-logo { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; letter-spacing: 6px; color: var(--ink); margin-bottom: 4px; }
.revo-demo .idle-state { font-size: 8.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); font-weight: 500; margin-bottom: 12px; }
.revo-demo .idle-rule { width: 26px; height: 1.5px; background: var(--gold-line); margin: 0 auto 12px; }
.revo-demo .idle-tag { font-family: 'Playfair Display', serif; font-style: italic; font-size: 11.5px; color: var(--ink-soft); line-height: 1.65; padding: 0 6px; }

.revo-demo .login-head { font-size: 15px; font-weight: 600; color: var(--ink); margin: 4px 0 1px; }
.revo-demo .login-sub { font-size: 9.5px; color: var(--ink-faint); margin-bottom: 14px; letter-spacing: 0.02em; }
.revo-demo .login-phone { letter-spacing: 0.08em; }
.revo-demo .pin-boxes { display: flex; gap: 8px; margin-bottom: 14px; }
.revo-demo .pb { width: 36px; height: 36px; border-radius: 7px; border: 1.5px solid var(--border2); background: var(--canvas); display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
.revo-demo .pb.on { background: var(--ink); border-color: var(--ink); }
.revo-demo .pb-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--white); }

.revo-demo .col-hd { margin-bottom: 11px; }
.revo-demo .col-who { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 1px; }
.revo-demo .col-where { font-size: 8.5px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
.revo-demo .chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
.revo-demo .chip { padding: 3px 9px; border-radius: 99px; font-size: 8.5px; font-weight: 500; border: 1px solid var(--border2); background: transparent; color: var(--ink-soft); letter-spacing: 0.03em; cursor: default; }
.revo-demo .chip.sel { background: var(--ink); color: var(--white); border-color: var(--ink); }
.revo-demo .f-lbl { font-size: 8.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 3px; font-family: 'JetBrains Mono', monospace; }
.revo-demo .amt-box { background: var(--canvas); border: 1.5px solid var(--border2); border-radius: 8px; padding: 9px 12px; display: flex; align-items: baseline; gap: 4px; margin-bottom: 9px; transition: border-color 0.2s; }
.revo-demo .amt-box.active { border-color: var(--gold); }
.revo-demo .amt-sym { font-size: 10px; color: var(--ink-soft); font-family: 'JetBrains Mono', monospace; }
.revo-demo .amt-num { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--ink); line-height: 1; }
.revo-demo .amt-cursor { display: inline-block; width: 2px; height: 22px; background: var(--gold); margin-left: 2px; vertical-align: middle; animation: blink-cur 0.8s step-end infinite; }
@keyframes blink-cur { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.revo-demo .t-field { width: 100%; padding: 7px 10px; background: var(--canvas); border: 1.5px solid var(--border2); border-radius: 7px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--ink); margin-bottom: 10px; }
.revo-demo .go-btn { width: 100%; padding: 10px; background: var(--ink); color: var(--white); border: none; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: transform 0.1s, box-shadow 0.1s; box-shadow: 0 2px 8px rgba(13,27,42,0.18); }
.revo-demo .go-btn.pressed { transform: scale(0.97); box-shadow: 0 1px 3px rgba(13,27,42,0.12); }

.revo-demo .suc { text-align: center; padding: 3px 0; }
.revo-demo .suc-ring { width: 46px; height: 46px; border-radius: 50%; background: var(--em-bg); border: 1.5px solid var(--em-line); display: flex; align-items: center; justify-content: center; margin: 0 auto 9px; animation: pop-in 0.4s cubic-bezier(.2,1.4,.4,1) both; }
@keyframes pop-in { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.revo-demo .suc-svg { width: 19px; height: 19px; stroke: var(--emerald); stroke-width: 2.5; fill: none; stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw 0.5s 0.2s ease forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
.revo-demo .suc-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
.revo-demo .suc-sub { font-size: 9.5px; color: var(--ink-soft); margin-bottom: 10px; letter-spacing: 0.03em; }
.revo-demo .receipt-id-block { background: var(--gold-light); border: 1px solid var(--gold-line); border-radius: 8px; padding: 7px 10px; margin-bottom: 9px; text-align: center; }
.revo-demo .receipt-id-lbl { font-size: 7.5px; color: var(--gold); letter-spacing: 0.12em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; margin-bottom: 2px; }
.revo-demo .receipt-id-val { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; color: var(--gold); letter-spacing: 0.15em; }
.revo-demo .sms-card { background: var(--em-bg); border: 1px solid var(--em-line); border-radius: 9px 9px 9px 3px; padding: 8px 10px; text-align: left; margin-bottom: 9px; animation: slide-sms 0.4s 0.15s ease both; transform-origin: left; }
@keyframes slide-sms { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
.revo-demo .sms-from { font-size: 7.5px; color: var(--emerald); font-family: 'JetBrains Mono', monospace; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 3px; }
.revo-demo .sms-msg { font-size: 8.5px; color: var(--emerald); line-height: 1.5; }
.revo-demo .rcpt { background: var(--canvas); border: 1px solid var(--border); border-radius: 7px; padding: 8px 10px; }
.revo-demo .rr { display: flex; justify-content: space-between; padding: 2px 0; }
.revo-demo .rr:not(:last-child) { border-bottom: 1px solid var(--border); }
.revo-demo .rl { font-size: 8px; color: var(--ink-faint); }
.revo-demo .rv { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 500; color: var(--ink); }

.revo-demo .ph-bar-payer { background: #2a2a2a; color: rgba(255,255,255,0.85); padding: 9px 14px 7px; font-family: 'Inter', sans-serif; font-size: 9px; letter-spacing: 0.04em; }
.revo-demo .ph-bar-payer .ph-carrier { font-weight: 600; }
.revo-demo .ph-bar-payer .ph-clock { font-variant-numeric: tabular-nums; }
.revo-demo .ph-bar-payer .ph-icons { display: inline-flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.85); }
.revo-demo .payer-scr { padding-top: 2px; }
.revo-demo .payer-app-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 0 9px; border-bottom: 1px solid var(--border); margin: -3px -3px 9px; padding-left: 3px; padding-right: 3px; }
.revo-demo .payer-app-back { font-size: 18px; line-height: 1; color: var(--sapphire); font-weight: 300; }
.revo-demo .payer-app-name { font-size: 11px; font-weight: 600; color: var(--ink); }
.revo-demo .payer-app-info { font-size: 14px; color: var(--ink-faint); letter-spacing: 0.05em; }
.revo-demo .payer-contact { display: flex; flex-direction: column; align-items: center; padding: 4px 0 11px; border-bottom: 1px solid var(--border); margin-bottom: 11px; }
.revo-demo .payer-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--gold); color: var(--white); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 13px; letter-spacing: 0.05em; margin-bottom: 6px; box-shadow: 0 2px 6px rgba(184,151,58,0.25); }
.revo-demo .payer-from { font-size: 11.5px; font-weight: 600; color: var(--ink); }
.revo-demo .payer-num { font-size: 7.5px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.07em; text-transform: uppercase; margin-top: 1px; }
.revo-demo .payer-time-divider { text-align: center; font-size: 8px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.07em; margin-bottom: 9px; text-transform: uppercase; }
.revo-demo .payer-msg-bubble { background: var(--canvas2); color: var(--ink); padding: 9px 12px; border-radius: 14px 14px 14px 4px; font-size: 10px; line-height: 1.55; max-width: 88%; margin-right: auto; animation: sms-arrive 0.55s cubic-bezier(.2,1.4,.4,1) both; box-shadow: 0 1px 2px rgba(13,27,42,0.05); }
@keyframes sms-arrive { from { opacity: 0; transform: translateY(10px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
.revo-demo .payer-msg-status { display: flex; align-items: center; gap: 3px; font-size: 7.5px; color: var(--emerald); margin-top: 5px; padding-left: 4px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.07em; text-transform: uppercase; animation: status-fade 0.4s 0.5s ease both; opacity: 0; }
@keyframes status-fade { to { opacity: 1; } }
.revo-demo .fraud { text-align: center; padding: 8px 0 6px; }
.revo-demo .fraud-ring { width: 46px; height: 46px; border-radius: 50%; background: var(--am-bg); border: 1.5px solid var(--am-line); display: flex; align-items: center; justify-content: center; font-size: 19px; margin: 0 auto 8px; animation: pulse-ring 1.5s ease infinite; }
@keyframes pulse-ring { 0%, 100% { box-shadow: 0 0 0 0 rgba(140,94,0,0.3); } 60% { box-shadow: 0 0 0 8px rgba(140,94,0,0); } }
.revo-demo .fraud-name { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 1px; }
.revo-demo .fraud-id { font-size: 8.5px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; margin-bottom: 9px; }
.revo-demo .fraud-alert { background: var(--cr-bg); border: 1px solid var(--cr-line); border-radius: 7px; padding: 7px 9px; font-size: 8.5px; color: var(--crimson); line-height: 1.55; margin-top: 7px; }

.revo-demo .imp-hed { font-family: 'Playfair Display', serif; font-style: italic; font-size: 12px; font-weight: 500; color: var(--gold); margin-bottom: 10px; border-bottom: 1px solid var(--gold-line); padding-bottom: 7px; }
.revo-demo .imp-cards { display: flex; flex-direction: column; gap: 6px; }
.revo-demo .imp-card { border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; gap: 8px; border: 1px solid; animation: pop-card 0.5s cubic-bezier(.2,1.2,.4,1) both; }
.revo-demo .imp-card:nth-child(1) { animation-delay: 0.05s; }
.revo-demo .imp-card:nth-child(2) { animation-delay: 0.15s; }
.revo-demo .imp-card:nth-child(3) { animation-delay: 0.25s; }
@keyframes pop-card { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.revo-demo .imp-card.e { background: var(--em-bg); border-color: var(--em-line); }
.revo-demo .imp-card.s { background: var(--sa-bg); border-color: var(--sa-line); }
.revo-demo .imp-card.a { background: var(--am-bg); border-color: var(--am-line); }
.revo-demo .imp-ico { font-size: 17px; flex-shrink: 0; }
.revo-demo .imp-big { font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 1px; }
.revo-demo .imp-sm { font-size: 8.5px; color: var(--ink-soft); }
.revo-demo .imp-foot { margin-top: 9px; padding-top: 7px; border-top: 1px solid var(--border); font-size: 8.5px; color: var(--ink-faint); line-height: 1.65; font-family: 'JetBrains Mono', monospace; }

.revo-demo .dash { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px 18px 18px; min-height: 0; }
.revo-demo .dash::-webkit-scrollbar { width: 3px; }
.revo-demo .dash::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

.revo-demo .dash-hd { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1.5px solid var(--canvas2); }
.revo-demo .dash-title { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: var(--ink); line-height: 1.1; margin-bottom: 2px; }
.revo-demo .dash-sub { font-size: 9px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
.revo-demo .live-chip { display: flex; align-items: center; gap: 5px; background: var(--em-bg); border: 1px solid var(--em-line); padding: 4px 9px; border-radius: 99px; font-size: 8.5px; font-weight: 600; color: var(--emerald); letter-spacing: 0.07em; flex-shrink: 0; margin-top: 2px; }
.revo-demo .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--emerald); animation: pulse-dot 1.8s ease infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.75); } }

.revo-demo .mets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; margin-bottom: 12px; }
.revo-demo .mc { background: var(--white); border: 1px solid var(--border); border-radius: 9px; padding: 11px 13px; position: relative; overflow: hidden; transition: box-shadow 0.2s; }
.revo-demo .mc::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2.5px; background: var(--canvas2); transition: background 0.5s, width 0.5s; }
.revo-demo .mc.flash::before { background: var(--gold2); }
.revo-demo .mc-lbl { font-size: 8.5px; font-weight: 600; letter-spacing: 0.1em; color: var(--ink-faint); text-transform: uppercase; margin-bottom: 5px; font-family: 'JetBrains Mono', monospace; }
.revo-demo .mc-val { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--ink); line-height: 1; margin-bottom: 3px; }
.revo-demo .mc-val.warn { color: var(--amber); }
.revo-demo .mc-note { font-size: 9.5px; color: var(--ink-faint); }
.revo-demo .mc-note.pos { color: var(--emerald); font-weight: 500; }
.revo-demo .mc-note.neg { color: var(--amber); font-weight: 500; }

.revo-demo .chart-wrap { background: var(--white); border: 1px solid var(--border); border-radius: 9px; padding: 11px 13px; margin-bottom: 12px; }
.revo-demo .chart-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.revo-demo .chart-title { font-size: 8.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; }
.revo-demo .chart-total { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); }
.revo-demo .bars { display: flex; align-items: flex-end; gap: 5px; height: 60px; }
.revo-demo .bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; }
.revo-demo .bar-fill { width: 100%; border-radius: 3px 3px 0 0; transition: height 1s cubic-bezier(.4,0,.2,1); min-height: 2px; }
.revo-demo .bar-lbl { font-size: 7px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; margin-top: 4px; letter-spacing: 0.04em; }

.revo-demo .alert-card { background: var(--am-bg); border: 1px solid var(--am-line); border-left: 3px solid var(--amber); border-radius: 8px; padding: 10px 12px; margin-bottom: 11px; display: flex; gap: 9px; align-items: flex-start; animation: slide-alert 0.4s ease both; }
@keyframes slide-alert { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
.revo-demo .al-ico { font-size: 13px; color: var(--amber); flex-shrink: 0; margin-top: 1px; animation: wobble 0.5s ease both; }
@keyframes wobble { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
.revo-demo .al-title { font-size: 10.5px; font-weight: 600; color: var(--amber); margin-bottom: 3px; }
.revo-demo .al-body { font-size: 9.5px; color: var(--ink-soft); line-height: 1.55; }

.revo-demo .rank-wrap { background: var(--white); border: 1px solid var(--border); border-radius: 9px; overflow: hidden; margin-bottom: 11px; }
.revo-demo .rank-row { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-bottom: 1px solid var(--border); }
.revo-demo .rank-row:last-child { border-bottom: none; }
.revo-demo .rank-row.flagged { background: var(--cr-bg); }
.revo-demo .rank-num { font-size: 8.5px; font-weight: 600; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; width: 16px; flex-shrink: 0; }
.revo-demo .rank-bar-wrap { flex: 1; height: 5px; background: var(--canvas2); border-radius: 3px; overflow: hidden; margin: 0 8px; }
.revo-demo .rank-bar-fill { height: 100%; border-radius: 3px; transition: width 0.9s cubic-bezier(.4,0,.2,1); }
.revo-demo .rank-name { font-size: 10px; font-weight: 500; color: var(--ink); width: 70px; flex-shrink: 0; }
.revo-demo .rank-amt { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--ink); flex-shrink: 0; }
.revo-demo .rank-flag { font-size: 9px; margin-left: 4px; }

.revo-demo .sec-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
.revo-demo .sec-title { font-size: 8.5px; font-weight: 600; letter-spacing: 0.11em; text-transform: uppercase; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; }
.revo-demo .sec-ct { font-size: 8.5px; color: var(--ink-ghost); font-family: 'JetBrains Mono', monospace; }
.revo-demo .feed-wrap { background: var(--white); border: 1px solid var(--border); border-radius: 9px; overflow: hidden; }
.revo-demo .feed-empty { padding: 16px; text-align: center; font-size: 10px; color: var(--ink-ghost); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
.revo-demo .txn { display: flex; align-items: center; gap: 9px; padding: 8px 12px; border-bottom: 1px solid var(--border); animation: scr-in 0.3s ease; }
.revo-demo .txn:last-child { border-bottom: none; }
.revo-demo .txn-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.revo-demo .txn-dot.ok { background: var(--emerald); box-shadow: 0 0 0 3px var(--em-bg); }
.revo-demo .txn-dot.fl { background: var(--amber); box-shadow: 0 0 0 3px var(--am-bg); }
.revo-demo .txn-info { flex: 1; min-width: 0; }
.revo-demo .txn-who { font-size: 10.5px; font-weight: 500; color: var(--ink); }
.revo-demo .txn-what { font-size: 8.5px; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; margin-top: 1px; }
.revo-demo .txn-amt { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; color: var(--ink); margin-left: auto; flex-shrink: 0; }
.revo-demo .txn-when { font-size: 8.5px; color: var(--ink-ghost); font-family: 'JetBrains Mono', monospace; margin-left: 7px; flex-shrink: 0; }

.revo-demo .ctrl { position: fixed; bottom: 0; left: 0; right: 0; z-index: 400; height: 62px; background: var(--white); border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: center; gap: 10px; padding: 0 22px; box-shadow: 0 -3px 16px rgba(13,27,42,0.05); }
.revo-demo .cb { padding: 8px 17px; border-radius: 7px; font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; cursor: pointer; border: 1.5px solid; transition: all 0.13s; display: flex; align-items: center; gap: 5px; text-transform: uppercase; }
.revo-demo .cb-primary { background: var(--ink); color: var(--white); border-color: var(--ink); box-shadow: 0 2px 8px rgba(13,27,42,0.15); }
.revo-demo .cb-primary:hover { background: var(--ink2); }
.revo-demo .cb-ghost { background: transparent; color: var(--ink-soft); border-color: var(--border2); }
.revo-demo .cb-ghost:hover { border-color: var(--ink3); color: var(--ink); }
.revo-demo .cb-ghost:disabled { opacity: 0.28; cursor: not-allowed; }
.revo-demo .prog-rail { flex: 1; max-width: 110px; height: 2px; background: var(--canvas2); border-radius: 1px; }
.revo-demo .prog-fill { height: 100%; background: var(--gold); border-radius: 1px; transition: width 0.4s cubic-bezier(.4,0,.2,1); }
.revo-demo .spd-btn { font-size: 8.5px; font-weight: 500; color: var(--ink-faint); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; background: none; border: 1px solid var(--border2); border-radius: 5px; padding: 4px 8px; cursor: pointer; transition: all 0.12s; }
.revo-demo .spd-btn:hover { color: var(--ink); border-color: var(--ink3); }
`;
