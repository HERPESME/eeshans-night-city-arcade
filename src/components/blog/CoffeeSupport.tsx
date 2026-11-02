import { useEffect, useRef, useState, type FormEvent } from 'react';
import { coffeeAmount, getCoffeeConfig, newCoffeeAttempt, readCoffeeAttempt, rememberCoffee, forgetCoffee, createCoffeeOrder, checkCoffee, loadRazorpay, openCoffeeCheckout, type CoffeeAttempt, type CoffeeConfig, type CoffeeResult } from '@/lib/coffee';
import { track } from '@/lib/analytics';
import './coffee.css';

type Stage = 'idle' | 'loading' | 'ready' | 'working' | 'checkout' | 'review' | 'paid' | 'refunded' | 'unavailable';
const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount / 100);

export default function CoffeeSupport({ article }: { article: string }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [config, setConfig] = useState<CoffeeConfig>();
  const [amount, setAmount] = useState('100');
  const [attempt, setAttempt] = useState<CoffeeAttempt>();
  const [result, setResult] = useState<CoffeeResult>();
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(false);
  const busy = useRef(false);
  const paymentReply = useRef(false);
  const amountInput = useRef<HTMLInputElement>(null);

  useEffect(() => { if (stage === 'ready') amountInput.current?.focus(); }, [stage]);
  const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unable to confirm this checkout. Please check its status before paying again.';
  const save = (value: CoffeeAttempt) => { rememberCoffee(value); setAttempt(value); };
  const showResult = (value: CoffeeResult) => {
    setResult(value);
    if (value.state === 'paid') { setStage('paid'); setMessage('Thank you for supporting the next deep dive.'); forgetCoffee(article); }
    else if (value.state === 'refunded') { setStage('refunded'); setMessage('A refund is recorded for this payment. Contact me if you need help.'); forgetCoffee(article); }
    else { setStage('review'); setMessage(value.state === 'pending' ? 'Your payment is still processing. Check its status before trying again.' : 'No completed payment was found. You can resume this same checkout.'); }
  };
  const expand = async () => {
    if (busy.current) return; busy.current = true; setStage('loading'); setMessage('');
    track('support_open', { article_slug: article });
    const previous = readCoffeeAttempt(article); setAttempt(previous);
    try {
      const current = await getCoffeeConfig(); setConfig(current);
      if (previous) { setAmount(String(previous.amount / 100)); setStage('review'); setMessage('An earlier checkout is saved in this tab. Check it before starting another.'); }
      else setStage(current.enabled ? 'ready' : 'unavailable');
    } catch (error) { setMessage(errorMessage(error)); setStage(previous ? 'review' : 'unavailable'); }
    finally { busy.current = false; }
  };
  const check = async () => {
    if (busy.current || !attempt?.orderId) return; busy.current = true; setStage('working'); setMessage('');
    try { showResult(await checkCoffee(attempt)); }
    catch (error) { setMessage(errorMessage(error)); setStage('review'); }
    finally { busy.current = false; }
  };
  const pay = async (event?: FormEvent) => {
    event?.preventDefault(); if (busy.current || !config?.enabled || !config.mode) return;
    const value = attempt?.amount ?? coffeeAmount(amount); if (value === undefined || (!attempt && !accepted)) return;
    if (attempt && attempt.mode !== config.mode) { setMessage('This saved checkout belongs to another payment mode. Contact me before starting another payment.'); return; }
    busy.current = true; setStage('working'); setMessage('');
    let current = attempt;
    try {
      if (current?.orderId) {
        const status = await checkCoffee(current);
        if (status.state !== 'unpaid') { showResult(status); return; }
      }
      const Constructor = await loadRazorpay();
      current ??= newCoffeeAttempt(article, value, config.mode); save(current);
      const order = current.orderId ? { orderId: current.orderId, amount: current.amount, currency: 'INR' as const, keyId: config.keyId!, mode: current.mode } : await createCoffeeOrder(current);
      const opened = { ...current, orderId: order.orderId }; save(opened);
      paymentReply.current = false; setStage('checkout');
      openCoffeeCheckout(Constructor, order, reply => {
        paymentReply.current = true; busy.current = true; setStage('working'); setMessage('Confirming your payment…');
        void checkCoffee(opened, reply).then(showResult).catch(error => { setStage('review'); setMessage(errorMessage(error)); }).finally(() => { busy.current = false; });
      }, () => {
        if (!paymentReply.current) { busy.current = false; setStage('review'); setMessage('Checkout closed. Check its status or resume the same payment here.'); }
      }, () => { setMessage('Payment was not completed. Retry inside Razorpay or close it and check the status here.'); });
      track('support_checkout', { article_slug: article, mode: order.mode });
    } catch (error) { setMessage(errorMessage(error)); setStage(current ? 'review' : 'ready'); }
    finally { if (!paymentReply.current) busy.current = false; }
  };
  const resetUnopened = () => {
    if (attempt?.orderId) return;
    forgetCoffee(article); setAttempt(undefined); setMessage(''); setStage(config?.enabled ? 'ready' : 'unavailable');
  };
  const waiting = ['loading', 'working', 'checkout'].includes(stage);

  return <aside className="blog-coffee-card" aria-label="Support TechNightCity" aria-busy={waiting}>
    <span aria-hidden="true" className="blog-coffee-icon">☕</span>
    <span className="blog-eyebrow">SUPPORT THE JOURNAL</span>
    <h2>Found it helpful?</h2>
    <p>A small coffee, a little fuel for the next deep dive.</p>
    {config?.mode === 'test' && <span className="coffee-test-label">TEST MODE · NO REAL MONEY</span>}
    {stage === 'idle' && <button type="button" onClick={() => void expand()}>Buy me a coffee <span aria-hidden="true">↗</span></button>}
    {stage === 'ready' && <form onSubmit={pay} className="coffee-form">
      <fieldset><legend>Choose your coffee</legend><div className="coffee-presets">{config?.presets.map(preset => <button key={preset} type="button" aria-pressed={coffeeAmount(amount) === preset} onClick={() => setAmount(String(preset / 100))}>{money(preset)}</button>)}</div></fieldset>
      <label htmlFor={`coffee-amount-${article}`}>Or choose an amount (INR)</label>
      <input ref={amountInput} id={`coffee-amount-${article}`} type="text" inputMode="decimal" autoComplete="off" value={amount} maxLength={7} onChange={event => setAmount(event.target.value)} aria-describedby={`coffee-range-${article}`} required />
      <small id={`coffee-range-${article}`}>₹50–₹5,000 · one-time payment</small>
      <label className="coffee-consent"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} required /><span>I understand this is voluntary, one-time support.</span></label>
      <button type="submit" disabled={coffeeAmount(amount) === undefined || !accepted}>Continue to Razorpay ↗</button>
      <small>Charged in INR. Available methods, including international cards, depend on your location and Razorpay approval. Your bank may charge for currency conversion.</small>
    </form>}
    {waiting && <p role="status">{stage === 'checkout' ? 'Complete your payment in Razorpay.' : stage === 'loading' ? 'Checking coffee support…' : 'Checking your payment…'}</p>}
    {stage === 'review' && <div className="coffee-recovery">
      {attempt?.orderId && <><p className="coffee-reference">Checkout reference<br /><code>{attempt.orderId}</code></p><button type="button" onClick={() => void check()}>Check payment status</button></>}
      {config?.enabled && result?.state !== 'pending' && <button type="button" className="coffee-secondary" onClick={() => void pay()}>{attempt?.orderId ? 'Resume same checkout' : 'Retry this checkout'}</button>}
      {attempt && !attempt.orderId && <button type="button" className="coffee-secondary" onClick={resetUnopened}>Reset unopened checkout</button>}
    </div>}
    {stage === 'unavailable' && <>{!message && <p>Coffee support is not available yet. Please check back soon.</p>}<button type="button" className="coffee-secondary" onClick={() => void expand()}>Check availability again</button></>}
    {(stage === 'paid' || stage === 'refunded') && <>{stage === 'paid' && result && <p>{money(result.amount)} · one-time support</p>}<p className="coffee-confirmation">{stage === 'paid' ? 'Coffee received. Thank you! ♡' : 'Refund recorded'}</p>{result?.paymentId && <p className="coffee-reference">Payment reference<br /><code>{result.paymentId}</code></p>}</>}
    {message && <p className="coffee-message" role="status" aria-live="polite">{message}</p>}
    <details className="coffee-terms"><summary>Payment & privacy details</summary><p>This supports Eeshan Singh’s TechNightCity writing. It does not buy a service, sponsorship, link, or priority reply. There is no subscription.</p><p>Razorpay collects and processes payment details. This site keeps payment references, amount, currency, article and status for reconciliation, and a checkout token in this tab for recovery. Card details are never stored by TechNightCity.</p><p>For payment issues or refund requests, <a href="mailto:eeshan@technightcity.com">email Eeshan</a> with your payment reference. Requests are reviewed individually.</p></details>
    {stage === 'idle' ? <small>One-time support. No account needed.</small> : <small className="coffee-help"><a href="mailto:eeshan@technightcity.com">Payment help ↗</a> · Secured checkout by Razorpay</small>}
  </aside>;
}
