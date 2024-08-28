import { Position } from "../types/monitoring";

export function lastInterestCollectionReached7Days(positions: Position[]) {
  const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
  
  const positionsWithLastInterestCollectionReached7Days = positions.filter(position => {
    // Check if lastInterestCollectionElapsed is greater than or equal to 7 days
    const isOverSevenDays = position.lastInterestCollectionElapsed >= sevenDaysInSeconds;
    
    // TODO: fix this
    const interestAccrued = (position.interestRate * position.amountInQT / 100 * ((Date.now() / 1000 - position.elapsed) / 86400 + 1) / 365)
    
    // Check if lastInterestCollectionElapsed is over 7 days and interestAccrued is greater than 1
    return isOverSevenDays && interestAccrued > 1;
  });
}