import json, wave, numpy as np
TL=json.load(open('src/timeline.json')); SLOW=TL['slow']; FPS=30
SC={}; acc=0
for n,l in TL['scenes']:
    d=round(l/SLOW+1e-9) if False else int(np.floor(l/SLOW+0.5)); SC[n]=acc; acc+=d
TOTAL=acc; T=TOTAL/FPS; SR=48000
def at(scene,lf): return SC[scene]+lf/SLOW   # real frame
rng=np.random.default_rng(3)
out=np.zeros(int(SR*(T+2)))
def lp(x,a):
    y=np.empty_like(x); s=0.0
    for i,v in enumerate(x): s+=a*(v-s); y[i]=s
    return y
def hp(x,a): return x-lp(x,a)
def env(n,att,dec):
    t=np.arange(n)/SR; return np.minimum(1,t/max(att,1e-4))*np.exp(-t/dec)
def add(sig,frame,gain):
    i=int(frame/FPS*SR); out[i:i+len(sig)]+=sig*gain
def load(path):
    w=wave.open(path); x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
    return x/np.max(np.abs(x))
def crunch(big=True):
    n=int(SR*0.34); s=np.zeros(n); grains=26 if big else 14
    for g in range(grains):
        st=int(rng.uniform(0,0.14 if big else 0.08)*SR*(1+g/grains)**0.5); L=int(SR*rng.uniform(0.002,0.007))
        s[st:st+L]+=hp(rng.standard_normal(L),0.35)*env(L,0.0003,0.0025)*rng.uniform(0.4,1)*(1-g/grains*0.6)
    t=np.arange(n)/SR
    s+=0.5*np.sin(2*np.pi*(150-60*t)*t)*np.exp(-t/0.035)
    s+=lp(hp(rng.standard_normal(n),0.25),0.35)*np.exp(-t/0.09)*0.25
    s=lp(s,0.6)  # a touch warmer / less harsh
    return s/np.max(np.abs(s))
def chew():
    n=int(SR*0.18); t=np.arange(n)/SR; s=np.zeros(n)
    for g in range(6):
        st=int(rng.uniform(0,0.08)*SR); L=int(SR*rng.uniform(0.003,0.008))
        s[st:st+L]+=lp(rng.standard_normal(L),0.45)*env(L,0.0005,0.003)*rng.uniform(.3,1)
    s+=0.35*np.sin(2*np.pi*110*t)*np.exp(-t/0.03)+lp(rng.standard_normal(n),0.08)*np.exp(-t/0.05)*0.6
    return s/np.max(np.abs(s))
def snap():
    n=int(SR*0.25); t=np.arange(n)/SR; s=np.zeros(n)
    for st,a in [(0,1),(0.012,0.6),(0.03,0.35)]:
        i=int(st*SR); L=int(SR*0.004); s[i:i+L]+=hp(rng.standard_normal(L),0.5)*env(L,0.0002,0.0015)*a
    s+=0.3*np.sin(2*np.pi*1150*t)*np.exp(-t/0.02)+0.3*np.sin(2*np.pi*620*t)*np.exp(-t/0.04)
    return lp(s,0.7)/np.max(np.abs(s))
def grit(dur=0.35):   # mango pressing into salt
    n=int(SR*dur); s=np.zeros(n)
    for _ in range(60):
        i=rng.integers(0,n-100); L=int(SR*0.0015); s[i:i+L]+=hp(rng.standard_normal(L),0.6)*rng.uniform(.2,1)
    s*=np.sin(np.pi*np.arange(n)/n)
    return s/np.max(np.abs(s))
def chime():  # very soft shimmer of wonder
    n=int(SR*2.2); t=np.arange(n)/SR; s=np.zeros(n)
    for k,(fr,dl) in enumerate([(1568,0),(2093,0.09),(2637,0.18),(3136,0.27)]):
        tt=np.clip(t-dl,0,None); s+=np.where(t>=dl,np.sin(2*np.pi*fr*tt)*np.exp(-tt/0.6)*(0.8**k),0)
    return s/np.max(np.abs(s))
vox_ohh=load('sfx/vox_ohh.wav'); vox_mmm=load('sfx/vox_mmm.wav')
ev=[]
ev.append((at('amazed',22),vox_ohh,0.32)); ev.append((at('amazed',24),chime(),0.05))
ev.append((at('pluck',52),snap(),0.32))
ev.append((at('sit',32),crunch(False),0.3))
for k in range(3): ev.append((at('sit',44+k*12),chew(),0.10))
ev.append((at('salt',82),grit(),0.12))
B=at('eat',40); ev.append((B,crunch(True),0.45))
ev.append((at('eat',64),vox_mmm,0.38))
for k in range(5): ev.append((at('eat',56+k*18),chew(),0.11))
for f,sig,g in ev: add(sig,f,g)
n=len(out); t=np.arange(n)/SR
w=lp(lp(rng.standard_normal(n),0.02),0.05); w=w/np.max(np.abs(w))*(0.6+0.4*np.sin(2*np.pi*0.07*t))*0.03
out+=w*np.minimum(1,t/1.5)*np.clip((T-t)/1.0,0,1)
out=out[:int(SR*T)]; out=out/max(1,np.max(np.abs(out))/0.89)
with wave.open('out/sfx.wav','wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((np.stack([out,out],1)*32767).astype('<i2').tobytes())
json.dump({'total_frames':TOTAL,'chorus_frame':B,'chorus_sec':B/FPS},open('out/cue.json','w'))
print(TOTAL, T, 'chorus at', B/FPS)
