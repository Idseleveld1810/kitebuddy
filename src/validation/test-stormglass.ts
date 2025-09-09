/**
 * Test script for Stormglass integration
 * Run with: npx tsx src/validation/test-stormglass.ts
 */

import { StormglassProvider } from '../server/providers/stormglass';
import spots from '../data/spots_with_wind_top50.json';

async function testStormglassIntegration() {
  const apiKey = process.env.STORMGLASS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ STORMGLASS_API_KEY not set');
    console.log('Please set your Stormglass API key:');
    console.log('export STORMGLASS_API_KEY=your_key_here');
    return;
  }

  console.log('🧪 Testing Stormglass Integration...\n');

  const stormglass = new StormglassProvider(apiKey);

  // Test with a Dutch spot (Domburg)
  const testSpot = spots.find(s => s.spotId === 'domburg');
  if (!testSpot) {
    console.error('❌ Test spot not found');
    return;
  }

  console.log(`📍 Testing with spot: ${testSpot.name} (${testSpot.latitude}, ${testSpot.longitude})`);

  try {
    // Test single day forecast
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const start = startDate.toISOString();
    const end = endDate.toISOString();

    console.log(`📅 Fetching data for: ${startDate.toDateString()}`);
    console.log(`⏰ Time range: ${start} to ${end}\n`);

    const marineData = await stormglass.fetchMarineData(
      testSpot.latitude,
      testSpot.longitude,
      start,
      end
    );

    console.log(`✅ Successfully fetched ${marineData.length} data points\n`);

    // Filter to kitesurfing hours
    const kitesurfingData = marineData.filter(hour => {
      const hourTime = new Date(hour.time);
      const hourOfDay = hourTime.getHours();
      return hourOfDay >= 6 && hourOfDay <= 22;
    });

    console.log(`🏄‍♂️ Kitesurfing hours (6:00-22:00): ${kitesurfingData.length} data points\n`);

    // Display sample data
    if (kitesurfingData.length > 0) {
      console.log('📊 Sample data points:');
      kitesurfingData.slice(0, 3).forEach((hour, index) => {
        const time = new Date(hour.time).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        console.log(`  ${index + 1}. ${time}:`);
        console.log(`     Wind: ${hour.windSpeed} kn (gusts: ${hour.windGust} kn, dir: ${hour.windDir}°)`);
        console.log(`     Waves: ${hour.waveHeight ? hour.waveHeight + 'm' : 'N/A'} (period: ${hour.wavePeriod ? hour.wavePeriod + 's' : 'N/A'})`);
        console.log(`     Current: ${hour.currentSpeed ? hour.currentSpeed + ' kn' : 'N/A'} (dir: ${hour.currentDirection ? hour.currentDirection + '°' : 'N/A'})`);
        console.log(`     Water temp: ${hour.oceanTemperature ? hour.oceanTemperature + '°C' : 'N/A'}`);
        console.log('');
      });
    }

    // Calculate statistics
    const windSpeeds = kitesurfingData.map(h => h.windSpeed).filter(s => s > 0);
    const waveHeights = kitesurfingData.map(h => h.waveHeight).filter(w => w !== null);
    const waterTemps = kitesurfingData.map(h => h.oceanTemperature).filter(t => t !== null);

    console.log('📈 Data Statistics:');
    console.log(`  Wind speeds: ${windSpeeds.length} points, avg: ${(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length).toFixed(1)} kn`);
    console.log(`  Wave heights: ${waveHeights.length} points, avg: ${waveHeights.length > 0 ? (waveHeights.reduce((a, b) => a + b, 0) / waveHeights.length).toFixed(2) + 'm' : 'N/A'}`);
    console.log(`  Water temps: ${waterTemps.length} points, avg: ${waterTemps.length > 0 ? (waterTemps.reduce((a, b) => a + b, 0) / waterTemps.length).toFixed(1) + '°C' : 'N/A'}`);

    // Check for kiteable conditions (15+ knots)
    const kiteableHours = kitesurfingData.filter(h => h.windSpeed >= 15);
    console.log(`\n🏄‍♂️ Kiteable conditions (15+ knots): ${kiteableHours.length} hours`);

    if (kiteableHours.length > 0) {
      console.log('  Kiteable time windows:');
      let currentWindow = null;
      
      kiteableHours.forEach(hour => {
        const time = new Date(hour.time).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        if (!currentWindow) {
          currentWindow = { start: time, end: time, speed: hour.windSpeed };
        } else {
          currentWindow.end = time;
          currentWindow.speed = Math.max(currentWindow.speed, hour.windSpeed);
        }
      });
      
      if (currentWindow) {
        console.log(`    ${currentWindow.start} - ${currentWindow.end} (max: ${currentWindow.speed} kn)`);
      }
    }

    console.log('\n✅ Stormglass integration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid Stormglass API key')) {
        console.log('\n💡 Please check your STORMGLASS_API_KEY');
      } else if (error.message.includes('rate limit')) {
        console.log('\n💡 API rate limit exceeded. Try again later.');
      }
    }
  }
}

// Run the test
testStormglassIntegration();

export { testStormglassIntegration };
