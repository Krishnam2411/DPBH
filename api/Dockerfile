FROM python:3.9
WORKDIR /app
COPY poetry.lock pyproject.toml /app/
COPY . /app
COPY .env /app/
RUN pip install poetry && poetry install
RUN poetry install --only main
EXPOSE $PORT
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]