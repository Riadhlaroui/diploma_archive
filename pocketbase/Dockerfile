# pocketbase/Dockerfile

# Use a minimal base image like Alpine
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /pb

# Copy the downloaded PocketBase binary from the build context
# The binary's name should match the one you copied into the 'pocketbase' directory
# Based on your screenshot, the binary is inside the directory 'pocketbase_0.34.2_linux_amd64'
# So you must ensure that inside your 'pocketbase' directory, you have the actual 'pocketbase' executable.

# Assuming you have copied the 'pocketbase' executable (from the downloaded zip)
# into the 'pocketbase' folder in your project root, alongside the Dockerfile.
# Or, based on the screenshot, it looks like you copied the WHOLE extracted folder.
# Let's use the actual executable which you show in the screenshot.

# If the executable is already named 'pocketbase' and is in the 'pocketbase' directory:
COPY pocketbase_0.34.2_linux_amd64/pocketbase .

# Make the executable runable
RUN chmod +x pocketbase

# Expose the default PocketBase port
EXPOSE 8090

# Start PocketBase, binding to all interfaces (0.0.0.0)
# This is crucial for Docker networking
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]