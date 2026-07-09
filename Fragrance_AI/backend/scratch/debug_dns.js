import dns from 'dns';
const { Resolver } = dns.promises;

async function checkDNS() {
    console.log('Testing DNS resolution for MongoDB SRV record...');
    const resolver = new Resolver();
    
    // Set servers to Google's public DNS
    resolver.setServers(['8.8.8.8', '8.8.4.4']);
    
    try {
        const srv = await resolver.resolveSrv('_mongodb._tcp.fragrance-ai.rrepxjp.mongodb.net');
        console.log('✅ SRV Record resolved:', JSON.stringify(srv, null, 2));
    } catch (err) {
        console.error('❌ SRV Resolution failed:', err.code, err.message);
        
        try {
            console.log('Trying standard resolution for fragrance-ai.rrepxjp.mongodb.net...');
            const addr = await resolver.resolve4('fragrance-ai.rrepxjp.mongodb.net');
            console.log('✅ Standard resolution:', addr);
        } catch (err2) {
            console.error('❌ Standard resolution also failed:', err2.code, err2.message);
        }
    }
}

checkDNS();
