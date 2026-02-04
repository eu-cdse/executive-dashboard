FROM python:3.9-slim

WORKDIR /app

COPY ./upload /app

COPY ./generate/codelist.json /app 

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "upload_codelist.py"]
