# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

### Bose SoundTouch Adapter Specific Context

This adapter provides integration with Bose SoundTouch speakers, enabling control and monitoring through ioBroker. Key characteristics:

- **Primary Function**: Controls Bose SoundTouch speakers over WebSocket connections and monitors real-time information
- **Key Dependencies**: WebSocket communication (`ws`), HTTP requests (`request`), XML parsing (`xml2js`)
- **Device Communication**: Uses WebSocket connections for real-time updates and HTTP API for control commands
- **Multi-room Support**: Handles zone management for grouping speakers together
- **Configuration Requirements**: Requires speaker IP address and optional reconnection timing
- **State Management**: Manages playback states, volume, sources, presets, and zone configurations

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        // Check states were created properly
                        const adapterStates = await new Promise((res, rej) => {
                            harness.states.getStatesOf('your-adapter.0', (err, states) => {
                                if (err) return rej(err);
                                res(states);
                            });
                        });

                        console.log('Found states:', adapterStates?.length || 0);
                        
                        // Verify expected states exist
                        if (!adapterStates || adapterStates.length === 0) {
                            return reject(new Error('No states created by adapter'));
                        }

                        // Check for key state
                        const infoConnection = adapterStates.find(state => 
                            state._id && state._id.includes('.info.connection')
                        );
                        
                        if (infoConnection) {
                            console.log('✅ Step 4: Integration test passed - key states found');
                            resolve();
                        } else {
                            reject(new Error('Expected info.connection state not found'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        });
    }
});
```

#### Bose SoundTouch Specific Testing Considerations

For this adapter, testing needs to account for:

- **Network Device Testing**: Mock SoundTouch API responses since physical devices may not be available
- **WebSocket Testing**: Use mock WebSocket servers for real-time communication testing
- **Zone Management**: Test multi-speaker grouping functionality with simulated devices
- **XML Parsing**: Provide sample XML responses from actual Bose devices for parsing tests
- **Connection Handling**: Test reconnection logic when devices go offline/online

Example mock data structure for testing:
```javascript
const mockBoseResponse = {
    deviceInfo: `<info deviceID="123456789012345678">
        <name>Living Room</name>
        <type>SoundTouch 20</type>
    </info>`,
    nowPlaying: `<nowPlaying deviceID="123456789012345678">
        <source>SPOTIFY</source>
        <track>Test Song</track>
        <artist>Test Artist</artist>
    </nowPlaying>`
};
```

## Development Best Practices

### Error Handling
- Always handle connection failures gracefully
- Implement reconnection logic for network devices
- Log errors at appropriate levels (error, warn, info, debug)
- Provide meaningful error messages to users

### Resource Management  
- Properly close WebSocket connections in `unload()` method
- Clear timers and intervals during cleanup
- Handle multiple simultaneous connections safely

### State Management
- Use consistent state naming conventions
- Implement proper state roles and types
- Handle state changes efficiently to avoid excessive API calls
- Validate state values before applying to devices

## Logging

Use these logging patterns consistently:
- `this.log.error()` - For errors that prevent normal operation
- `this.log.warn()` - For unexpected conditions that don't break functionality  
- `this.log.info()` - For important status information
- `this.log.debug()` - For detailed debugging information

Example logging for this adapter:
```javascript
this.log.info(`Connected to SoundTouch device at ${this.config.address}`);
this.log.warn(`Device not responding, attempting reconnection in ${reconnectTime}s`);
this.log.error(`Failed to parse XML response: ${error.message}`);
this.log.debug(`Received WebSocket message: ${message}`);
```

## Adapter Lifecycle

### Initialization (`onReady`)
```javascript
async onReady() {
  // Validate configuration
  if (!this.config.address) {
    this.log.error('No address configured! Please configure the adapter first.');
    return;
  }
  
  // Initialize objects and states
  await this.initObjects();
  
  // Subscribe to state changes
  this.subscribeStates('*');
  
  // Start connection to device
  this._connect();
}
```

### State Changes (`onStateChange`)
```javascript
async onStateChange(id, state) {
  if (state && !state.ack) {
    // Handle command from user
    const command = id.split('.').pop();
    await this.handleCommand(command, state.val);
  }
}
```

### Cleanup (`unload`)
```javascript
unload(callback) {
  try {
    // Stop timers
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = undefined;
    }
    // Close connections, clean up resources
    callback();
  } catch (e) {
    callback();
  }
}
```

## Code Style and Standards

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods

## CI/CD and Testing Integration

### GitHub Actions for API Testing
For adapters with external API dependencies, implement separate CI/CD jobs:

```yaml
# Tests API connectivity with demo credentials (runs separately)
demo-api-tests:
  if: contains(github.event.head_commit.message, '[skip ci]') == false
  
  runs-on: ubuntu-22.04
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run demo API tests
      run: npm run test:integration-demo
```

### CI/CD Best Practices
- Run credential tests separately from main test suite
- Use ubuntu-22.04 for consistency
- Don't make credential tests required for deployment
- Provide clear failure messages for API connectivity issues
- Use appropriate timeouts for external API calls (120+ seconds)

### Package.json Script Integration
Add dedicated script for credential testing:
```json
{
  "scripts": {
    "test:integration-demo": "mocha test/integration-demo --exit"
  }
}
```

### Practical Example: Complete API Testing Implementation
Here's a complete example based on lessons learned from the Discovergy adapter:

#### test/integration-demo.js
```javascript
const path = require("path");
const { tests } = require("@iobroker/testing");

// Helper function to encrypt password using ioBroker's encryption method
async function encryptPassword(harness, password) {
    const systemConfig = await harness.objects.getObjectAsync("system.config");
    
    if (!systemConfig || !systemConfig.native || !systemConfig.native.secret) {
        throw new Error("Could not retrieve system secret for password encryption");
    }
    
    const secret = systemConfig.native.secret;
    let result = '';
    for (let i = 0; i < password.length; ++i) {
        result += String.fromCharCode(secret[i % secret.length].charCodeAt(0) ^ password.charCodeAt(i));
    }
    
    return result;
}

// Run integration tests with demo credentials
tests.integration(path.join(__dirname, ".."), {
    defineAdditionalTests({ suite }) {
        suite("API Testing with Demo Credentials", (getHarness) => {
            let harness;
            
            before(() => {
                harness = getHarness();
            });

            it("Should connect to API and initialize with demo credentials", async () => {
                console.log("Setting up demo credentials...");
                
                if (harness.isAdapterRunning()) {
                    await harness.stopAdapter();
                }
                
                const encryptedPassword = await encryptPassword(harness, "demo_password");
                
                await harness.changeAdapterConfig("your-adapter", {
                    native: {
                        username: "demo@provider.com",
                        password: encryptedPassword,
                        // other config options
                    }
                });

                console.log("Starting adapter with demo credentials...");
                await harness.startAdapter();
                
                // Wait for API calls and initialization
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                const connectionState = await harness.states.getStateAsync("your-adapter.0.info.connection");
                
                if (connectionState && connectionState.val === true) {
                    console.log("✅ SUCCESS: API connection established");
                    return true;
                } else {
                    throw new Error("API Test Failed: Expected API connection to be established with demo credentials. " +
                        "Check logs above for specific API errors (DNS resolution, 401 Unauthorized, network issues, etc.)");
                }
            }).timeout(120000);
        });
    }
});
```

### Bose SoundTouch Specific Development Patterns

When working with this adapter, apply these patterns:

#### WebSocket Connection Management
```javascript
// Establish connection with reconnection logic
_connect() {
    if (this.socket) {
        this.socket.close();
    }
    
    try {
        this.socket = new soundtouchsocket(this.adapter);
        this.socket.on('connect', () => {
            this.log.info('Connected to SoundTouch device');
            this.setState('info.connection', true, true);
        });
        
        this.socket.on('error', (err) => {
            this.log.error(`Connection error: ${err.message}`);
            this.setState('info.connection', false, true);
            this._reconnect();
        });
    } catch (error) {
        this.log.error(`Failed to establish connection: ${error.message}`);
        this._reconnect();
    }
}
```

#### Zone Management
```javascript
// Handle multi-speaker zone operations
async createZone(masterMac, slaveMacs) {
    const masterDevice = this.findDeviceByMac(masterMac);
    const slaveDevices = slaveMacs.map(mac => this.findDeviceByMac(mac));
    
    if (!masterDevice) {
        throw new Error(`Master device with MAC ${masterMac} not found`);
    }
    
    return this.socket.createZone(masterDevice, slaveDevices);
}
```

#### State Object Creation
```javascript
// Create adapter-specific state objects
async initObjects() {
    await this.setObjectNotExistsAsync('volume', {
        type: 'state',
        common: {
            name: 'Volume',
            type: 'number',
            role: 'level.volume',
            min: 0,
            max: 100,
            write: true
        },
        native: {}
    });
    
    await this.setObjectNotExistsAsync('zones.masterOf', {
        type: 'state',
        common: {
            name: 'Master of speakers',
            type: 'string',
            role: 'value',
            read: true,
            write: false
        },
        native: {}
    });
}
```