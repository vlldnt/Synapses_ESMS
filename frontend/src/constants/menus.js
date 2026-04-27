export const MENUS = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    route: "/",
    icon: "LayoutDashboard",
    section: "Menu",
    roleAccess: ["agent", "direction", "admin"],
  },
  {
    id: "agents",
    label: "Générer un document",
    route: "/compte_rendu_intervention",
    icon: "BotMessageSquare",
    section: "Agents",
    roleAccess: ["agent", "direction", "admin"],
  },
  {
    id: "historique",
    label: "Archives",
    route: "/archives",
    icon: "History",
    section: "Gestion",
    roleAccess: ["agent", "direction", "admin"],
  },
];
