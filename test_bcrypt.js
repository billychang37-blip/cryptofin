
const bcrypt = require('bcryptjs');
async function test() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('1234', salt);
    console.log('Success:', hash);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
