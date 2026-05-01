import api from "./axiosInstance";

export const getCorporate      = ()       => api.get("/corporate");
export const updateHeroStats   = (items)  => api.put("/corporate/hero-stats",   { items });
export const updateValues      = (items)  => api.put("/corporate/values",       { items });
export const updateMilestones  = (items)  => api.put("/corporate/milestones",   { items });
export const updateGlobalStats = (items)  => api.put("/corporate/global-stats", { items });
export const updateRegions     = (items)  => api.put("/corporate/regions",      { items });
export const updateCerts       = (items)  => api.put("/corporate/certs",        { items });
