import React, { useState, useMemo } from "react";

const BARBERS = {
  PEREIRA: {
    id: "PEREIRA",
    name: "Pereira",
    whatsapp: "+5546991114797",
    schedule: [
      { days: [1, 2, 3, 4, 5], segments: [{ start: "08:00", end: "11:30" }, { start: "14:00", end: "19:00" }] },
      { days: [6], segments: [] },
    ],
  },
  JAPA: {
    id: "JAPA",
    name: "Japa",
    whatsapp: "+5546999746619",
    schedule: [
      { days: [1, 2, 3, 4, 5], segments: [{ start: "14:00", end: "19:00" }] },
      { days: [6], segments: [] },
    ],
  },
};

const PROCEDURES = [
  { id: "CABELO_ADULTO", label: "Cabelo masculino adulto", price: 35 },
  { id: "BARBA", label: "Barba", price: 30 },
  { id: "CABELO_BARBA", label: "Cabelo e Barba", price: 55 },
  { id: "CABELO_INFANTIL", label: "Cabelo infantil masculino", price: 30 },
  { id: "SOBRANCELHA", label: "Sobrancelha masculina (navalhada)", price: 15 },
  { id: "FEM_CURTO", label: "Corte feminino curto (Somente Japa)", price: 35, onlyWith: "JAPA" },
  { id: "FEM_LONGO", label: "Corte feminino longo (Somente Japa)", price: 55, onlyWith: "JAPA" },
];

const SLOT_MINUTES = 40;

function pad(n) {
  return n.toString().padStart(2, "0");
}

function timeToMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function minutesToTime(m) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad(hh)}:${pad(mm)}`;
}

function getDayIndex(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay();
}

function generateSlotsForBarber(barber, dateStr) {
  const dayIndex = getDayIndex(dateStr);
  if (dayIndex === 0) return [];
  const entry = barber.schedule.find((s) => s.days.includes(dayIndex));
  if (!entry || !entry.segments || entry.segments.length === 0) return [];
  const slots = [];
  entry.segments.forEach((seg) => {
    let cur = timeToMinutes(seg.start);
    const end = timeToMinutes(seg.end);
    while (cur + SLOT_MINUTES <= end) {
      slots.push(minutesToTime(cur));
      cur += SLOT_MINUTES;
    }
  });
  return slots;
}

export default function App() {
  const today = new Date().toISOString().slice(0, 10);

  const [barberId, setBarberId] = useState("PEREIRA");
  const [procedureId, setProcedureId] = useState(PROCEDURES[0].id);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const barber = useMemo(() => BARBERS[barberId], [barberId]);
  const proceduresForBarber = PROCEDURES.filter((p) => !p.onlyWith || p.onlyWith === barberId);
  const slots = useMemo(() => generateSlotsForBarber(barber, date), [barber, date]);

  const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  function handleConfirm(e) {
    e.preventDefault();
    if (!name || !phone || !time || !procedureId) {
      alert("Preencha nome, telefone, procedimento e horário antes de confirmar.");
      return;
    }

    const proc = PROCEDURES.find((p) => p.id === procedureId);

    const message = `Agendamento confirmado:%0ACliente: ${encodeURIComponent(name)}%0AProcedimento: ${encodeURIComponent(proc.label)}%0AData: ${encodeURIComponent(date)} às ${encodeURIComponent(time)}%0ATelefone: ${encodeURIComponent(phone)}`;

    const waLink = `https://wa.me/${barber.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`;

    window.open(waLink, "_blank");

    alert("Agendamento enviado via WhatsApp para o barbeiro.");

    setName("");
    setPhone("");
    setTime("");
    setDate(today);
    setProcedureId(PROCEDURES[0].id);
    setBarberId("PEREIRA");
  }

  return (
    <div style={{minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{width: "100%", maxWidth: 980, background: "linear-gradient(180deg,#111,#000)", borderRadius: 18, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.6)"}}>
        <header style={{display: "flex", gap: 16, alignItems: "center", marginBottom: 18}}>
          <div style={{width:64, height:64, borderRadius:32, background:"#c59a3a", display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:700}}>BDP</div>
          <div>
            <h1 style={{margin:0, fontSize:22, fontWeight:800}}>BARBIERE DI PEREIRA</h1>
            <p style={{margin:0, color:"#ccc"}}>Agende seu atendimento — cortes de 40 minutos</p>
          </div>
        </header>

        <main style={{display:"flex", gap:24}}>
          <form onSubmit={handleConfirm} style={{flex:1, display:"flex", flexDirection:"column", gap:12}}>
            <label>Barbeiro
              <select value={barberId} onChange={(e)=>setBarberId(e.target.value)} style={{width:"100%", marginTop:6, padding:8, borderRadius:8, background:"#111", color:"#fff"}}>
                <option value="PEREIRA">Pereira</option>
                <option value="JAPA">Japa</option>
              </select>
            </label>

            <label>Procedimento
              <select value={procedureId} onChange={(e)=>setProcedureId(e.target.value)} style={{width:"100%", marginTop:6, padding:8, borderRadius:8, background:"#111", color:"#fff"}}>
                {proceduresForBarber.map((p)=>(<option key={p.id} value={p.id}>{p.label} — {fmt(p.price)}</option>))}
              </select>
            </label>

            <label>Data
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} style={{width:"100%", marginTop:6, padding:8, borderRadius:8, background:"#111", color:"#fff"}} />
              <p style={{fontSize:12, color:"#999", marginTop:6}}>Segunda a sexta (confira horários). Domingo fechado. Sábado: Pereira — ordem de chegada; Japa — favor confirmar por WhatsApp.</p>
            </label>

            <label>Horário
              <select value={time} onChange={(e)=>setTime(e.target.value)} style={{width:"100%", marginTop:6, padding:8, borderRadius:8, background:"#111", color:"#fff"}}>
                <option value="">-- Escolha um horário --</option>
                {slots.length === 0 && <option value="disable">Nenhum horário disponível para essa data</option>}
                {slots.map((s)=>(<option key={s} value={s}>{s}</option>))}
              </select>
            </label>

            <label>Nome do cliente
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nome completo" style={{width:"100%", marginTop:6, padding:8, borderRadius:8, background:"#111", color:"#fff"}} />
            </label>

            <label>WhatsApp (ex: 54999111xxxx)
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="(DDD) 9xxxx-xxxx" style={{width:"100%", marginTop:6, padding:8, borderRadius:8, background:"#111", color:"#fff"}} />
            </label>

            <button type="submit" style={{marginTop:8, padding:12, borderRadius:12, background:"#c59a3a", color:"#000", fontWeight:700}}>Confirmar agendamento</button>
          </form>

          <aside style={{width:360, background:"#0d0d0d", padding:16, borderRadius:12}}>
            <h3 style={{marginTop:0}}>Resumo</h3>
            <p><strong>Barbeiro:</strong> {barber.name}</p>
            <p><strong>Procedimento:</strong> {PROCEDURES.find((p)=>p.id===procedureId)?.label} — {fmt(PROCEDURES.find((p)=>p.id===procedureId)?.price || 0)}</p>
            <p><strong>Data:</strong> {date}</p>
            <p><strong>Horário:</strong> {time || "—"}</p>

            <div style={{marginTop:12}}>
              <h4 style={{margin:0}}>Observações importantes</h4>
              <ul style={{color:"#bbb"}}>
                <li>Todos os serviços duram 40 minutos.</li>
                <li>Sábado: Pereira — atendimento por ordem de chegada (não agende online para Pereira). Japa — favor confirmar por WhatsApp.</li>
                <li>Ao confirmar, abriremos o WhatsApp do barbeiro.</li>
                <li>Domingo: barbearia fechada.</li>
              </ul>
            </div>

            <div style={{marginTop:12}}>
              <h4 style={{margin:0}}>Contatos</h4>
              <p>Pereira: <a style={{color:"#c59a3a"}} href={"https://wa.me/"+BARBERS.PEREIRA.whatsapp.replace(/[^0-9]/g,"")} target="_blank" rel="noreferrer">{BARBERS.PEREIRA.whatsapp}</a></p>
              <p>Japa: <a style={{color:"#c59a3a"}} href={"https://wa.me/"+BARBERS.JAPA.whatsapp.replace(/[^0-9]/g,"")} target="_blank" rel="noreferrer">{BARBERS.JAPA.whatsapp}</a></p>
            </div>

            <div style={{marginTop:12}}>
              <h4 style={{margin:0}}>Publicação</h4>
              <ol style={{color:"#bbb"}}>
                <li>Crie um repositório no GitHub com este projeto.</li>
                <li>Suba os arquivos (upload .zip ou via Git).</li>
                <li>Conecte o repositório no Vercel e faça deploy.</li>
              </ol>
            </div>
          </aside>
        </main>

        <footer style={{textAlign:"center", marginTop:18, color:"#777"}}>© BARBIERE DI PEREIRA</footer>
      </div>
    </div>
  );
}
