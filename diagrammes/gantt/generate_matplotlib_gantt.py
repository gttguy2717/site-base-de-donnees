import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta

# Données exactes des tâches
tasks = [
    {
        "id": 1,
        "name": "1. Prise de contact, immersion et compréhension du projet",
        "start": "2026-08-03",
        "days": 5,
        "color": "#1f77b4"  # Bleu tab:blue
    },
    {
        "id": 2,
        "name": "2. Étude de l'existant et rédaction du cahier des charges",
        "start": "2026-08-08",
        "days": 4,
        "color": "#ff7f0e"  # Orange tab:orange
    },
    {
        "id": 3,
        "name": "3. Modélisation conceptuelle PU/UML",
        "start": "2026-08-12",
        "days": 6,
        "color": "#2ca02c"  # Vert tab:green
    },
    {
        "id": 4,
        "name": "4. Développement de l'API Backend Node.js / Express et base de données",
        "start": "2026-08-18",
        "days": 10,
        "color": "#d62728"  # Rouge tab:red
    },
    {
        "id": 5,
        "name": "5. Développement de la Plateforme Web React.js & CSS",
        "start": "2026-08-28",
        "days": 12,
        "color": "#9467bd"  # Violet tab:purple
    },
    {
        "id": 6,
        "name": "6. Développement de l'Application Mobile React Native / Expo",
        "start": "2026-09-09",
        "days": 12,
        "color": "#8c564b"  # Marron tab:brown
    },
    {
        "id": 7,
        "name": "7. Tests d'intégration et corrections",
        "start": "2026-09-21",
        "days": 6,
        "color": "#e377c2"  # Rose tab:pink
    },
]

# Configuration du graphique
fig, ax = plt.subplots(figsize=(15, 7), dpi=300)

y_positions = list(range(len(tasks)))
y_labels = [t["name"] for t in tasks]

# Dessin des barres horizontales
for idx, task in enumerate(tasks):
    start_dt = datetime.strptime(task["start"], "%Y-%m-%d")
    end_dt = start_dt + timedelta(days=task["days"])
    start_num = mdates.date2num(start_dt)
    end_num = mdates.date2num(end_dt)
    duration = end_num - start_num

    ax.barh(
        idx,
        duration,
        left=start_num,
        height=0.55,
        align='center',
        color=task["color"],
        edgecolor='none',
        zorder=3
    )

# Formatage de l'axe Y
ax.set_yticks(y_positions)
ax.set_yticklabels(y_labels, fontsize=7.5, color='#222222')
ax.set_ylim(-0.5, len(tasks) - 0.5)

# Formatage de l'axe X (dates tous les 3 jours de 03/08 à 29/09)
date_start = datetime(2026, 8, 3)
date_end = datetime(2026, 9, 29)

tick_dates = []
curr = date_start
while curr <= date_end:
    tick_dates.append(curr)
    curr += timedelta(days=3)

tick_nums = [mdates.date2num(d) for d in tick_dates]
ax.set_xticks(tick_nums)
ax.set_xticklabels([d.strftime("%d/%m") for d in tick_dates], rotation=45, ha='right', fontsize=7.5, color='#222222')

ax.set_xlim(mdates.date2num(date_start), mdates.date2num(date_end))
ax.set_xlabel("Calendrier 2026", fontsize=9, labelpad=8, color='#222222')

# Titre
ax.set_title("Diagramme de Gantt — SOUTARAH GROUP", fontsize=12, pad=12, fontweight='normal', color='#222222')

# Grille verticale subtile uniquement sur l'axe x
ax.grid(axis='x', color='#e5e7eb', linestyle='-', linewidth=0.8, alpha=0.8, zorder=1)

# Bordures de la boîte
for spine in ax.spines.values():
    spine.set_color('#333333')
    spine.set_linewidth(0.8)

# Ticks
ax.tick_params(axis='both', which='both', color='#333333', length=4, width=0.8)

plt.tight_layout()

output_dir = os.path.dirname(os.path.abspath(__file__))
output_png = os.path.join(output_dir, "diagramme-gantt.png")
output_png_clean = os.path.join(output_dir, "diagramme-gantt-image.png")

plt.savefig(output_png, dpi=300, bbox_inches='tight')
plt.savefig(output_png_clean, dpi=300, bbox_inches='tight')
plt.close()

print(f"Gantt exporté avec succès vers : {output_png}")
