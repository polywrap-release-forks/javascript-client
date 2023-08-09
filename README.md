![polywrap-banner](https://raw.githubusercontent.com/polywrap/branding/master/assets/banner.png)

# Javascript Client

Implementation of the Polywrap client in JavaScript.

## Installation
```
npm install @polywrap/client
# or
yarn add @polywrap/client
```

## Getting Started

Create a new Polywrap client config builder instance, add the bundles you want to use, and then create a new Polywrap client instance with the config.

```typescript
import { 
    PolywrapClient,
    PolywrapClientConfigBuilder
} from "@polywrap/client";

const builder = new PolywrapClientConfigBuilder();
builder.addBundle("sys");
const client = new PolywrapClient(builder.build());

const result = await client.invoke<boolean>({
  uri: "wrapscan.io/polywrap/logging@1.0.0",
  method: "info",
  args: {
    message: "Hello from hello world wrap!",
  }
});

if (!result.ok) {
  throw Error("Log message error: " + result.error);
}
```

# Getting Started

Have questions or want to get involved? Join our community [Discord](https://discord.polywrap.io) or [open an issue](https://github.com/polywrap/javascript-client/issues) on Github.

For detailed information about Polywrap and the WRAP standard, visit our [developer documentation](https://docs.polywrap.io/).



# Resources

- [Examples](./examples/)
- [Features supported](https://github.com/polywrap/client-readiness/tree/main/clients/js/src/features)
