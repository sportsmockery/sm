export interface HomepageTeam {
  id: string
  name: string
  color: string
  secondaryColor: string
  logo: string
}

export const homepageTeams: HomepageTeam[] = [
  {
    id: "bears",
    name: "Bears",
    color: "#0B162A",
    secondaryColor: "#C83803",
    logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
  },
  {
    id: "bulls",
    name: "Bulls",
    color: "#CE1141",
    secondaryColor: "#000000",
    logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
  },
  {
    id: "cubs",
    name: "Cubs",
    color: "#0E3386",
    secondaryColor: "#CC3433",
    logo: "https://a.espncdn.com/i/teamlogos/mlb/500/chc.png",
  },
  {
    id: "blackhawks",
    name: "Blackhawks",
    color: "#CF0A2C",
    secondaryColor: "#FFD100",
    logo: "https://a.espncdn.com/i/teamlogos/nhl/500/chi.png",
  },
  {
    id: "whitesox",
    name: "White Sox",
    color: "#27251F",
    secondaryColor: "#C4CED4",
    logo: "https://a.espncdn.com/i/teamlogos/mlb/500/chw.png",
  },
]
