# TutelaIA

Plataforma LegalTech que automatiza la contestación de acciones de tutela en Colombia. Desarrollada durante una pasantía en **Lawyers Solutions**.

---

## El problema

Los abogados reciben notificaciones de tutela con solo **10 días hábiles** para contestar (Decreto 2591/91). El proceso manual — leer el expediente, identificar los hechos, redactar la contestación y hacer seguimiento de plazos — consume tiempo crítico que no siempre existe.

TutelaIA automatiza cada paso de ese flujo.

---

## Funcionalidades

**Extracción inteligente de documentos**
El abogado sube el PDF del auto admisorio y el escrito de tutela. La IA extrae automáticamente accionante, accionado, hechos, derechos invocados, juzgado y radicado, pre-llenando el formulario del caso.

**Generación de contestación jurídica**
Con un clic el sistema genera un borrador completo de contestación con el contexto legal del caso, listo para revisión y ajuste por el abogado.

**Exportación a Word**
El documento final se descarga en `.docx` con formato jurídico: márgenes legales, encabezado con las partes, pie de página numerado y tipografía Times New Roman.

**Alertas automáticas de vencimiento**
Un cron job diario calcula los días hábiles restantes y envía un email de alerta vía Gmail cuando quedan 3 días o menos para contestar.

**Panel de gestión de casos**
Vista centralizada con estados (Pendiente, En proceso, Contestada, Vencida), plazos y seguimiento por expediente.


---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | Next.js API Routes, NextAuth v4 |
| Base de datos | PostgreSQL (Supabase) + Prisma 7 |
| IA | Groq — LLaMA 3.3 70B |
| Email | Nodemailer + Gmail SMTP |
| Exportación | docx, unpdf |
| Deploy | Vercel |

---


Desarrollado por **Juan Ramírez** —  Lawyers Solutions · 2025
