from setuptools import setup, find_packages

setup(
    name="sonification_broadcast",
    version="1.0.0",
    description="A real-time AI-ready data-to-sound encoder and decoder system.",
    author="Your Name",
    license="MIT",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "numpy",
        "scipy",
        "sounddevice",
        "soundfile",
        "whisper @ git+https://github.com/openai/whisper.git",
        "matplotlib",
        "tk",
    ],
    entry_points={
        "console_scripts": [
            "broadcast-cli=broadcast_cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
    ],
    python_requires=">=3.9",
)
