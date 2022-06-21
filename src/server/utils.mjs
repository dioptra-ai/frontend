import mongoose from 'mongoose';

export const manageTransaction = async (transactionalFunction) => {
    const session = await mongoose.startSession();

    let sessionResult = null;

    let sessionError = null;

    await session.withTransaction(async () => {
        try {
            sessionResult = await transactionalFunction(session);
        } catch (e) {
            sessionError = e;
        }
    });

    session.endSession();

    if (sessionError) {

        throw sessionError;
    } else {

        return sessionResult;
    }
};
