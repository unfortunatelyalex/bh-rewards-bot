#big monkeys dont edit this file
#!/bin/bash

screen -dm -S bh_rewards npm run start 2>&1 | tee logs/last_run.log
echo "Session started."
