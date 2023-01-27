// fake nats client for tests only

export const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
            callback();
        })
    }
};