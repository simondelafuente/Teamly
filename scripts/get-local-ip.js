/**
 * Script para obtener la IP local de la máquina
 * Útil para configurar manualmente la URL del API si es necesario
 */

const os = require('os');

function getLocalIP() {
  const nets = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Solo IPv4 y no interna
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({
          interface: name,
          address: net.address
        });
      }
    }
  }
  
  return ips;
}

const localIPs = getLocalIP();

if (localIPs.length === 0) {
  console.log('❌ No se encontró ninguna IP local');
  console.log('💡 Asegúrate de estar conectado a una red');
} else {
  console.log('✅ IPs locales encontradas:');
  localIPs.forEach(({ interface: iface, address }) => {
    console.log(`   ${iface}: ${address}`);
    console.log(`   URL del API: http://${address}:3000/api`);
  });
  console.log('\n💡 La aplicación detectará automáticamente la IP correcta.');
  console.log('💡 Solo necesitas configurar manualmente si usas un dispositivo físico.');
}
