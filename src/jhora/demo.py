import sys
import dateutil
from dateutil.parser import parse
print("Python version: ", sys.version)
print("dateutil version: ", dateutil.__version__)
dt = parse("2024-06-01T12:00:00Z")
print("Parsed datetime: ", dt)

