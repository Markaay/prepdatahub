# Python
import pandas as pd
import numpy as np
from fbprophet import Prophet
from sqlalchemy import create_engine


# Connection
connection = create_engine('mysql+mysqldb://prepmetrics:ihavesothoeife22eersfe#23243fFFEWwew@192.81.221.83[:3306]/datahub')

# Python
df = pd.read_sql('SELECT * FROM fb_pagedate', con=connection)
print(df)


# df = pd.read_csv('../examples/example_wp_peyton_manning.csv')
# df['y'] = np.log(df['y'])
# df.head()