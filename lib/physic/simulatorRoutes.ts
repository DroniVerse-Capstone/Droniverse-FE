/**
 * Mapping table from backend simulator codes to frontend routes.
 * Add new static pages here as they are developed.
 */
export const SIMULATOR_ROUTE_MAP: Record<string, string> = {
  "quadcopter_mechanics": "/mechanics/quadcopter",
  // Add more mappings here:
  // "hexacopter_physics": "/physics/hexacopter",
};

/**
 * Gets the localized or absolute route for a simulator based on its code.
 * Falls back to a default simulator lab view if no specific route is found.
 */
export function getSimulatorRoute(code: string, id: string, returnUrl?: string): string {
  const specificRoute = SIMULATOR_ROUTE_MAP[code];
  
  let targetRoute = specificRoute || `/simulator-lab?id=${id}`;

  // If a return URL is provided, append it as a query parameter
  if (returnUrl) {
    const separator = targetRoute.includes('?') ? '&' : '?';
    targetRoute = `${targetRoute}${separator}returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  return targetRoute;
}
