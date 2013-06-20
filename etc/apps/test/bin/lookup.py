#-*- coding:utf8 -*-
#python--log输出
#SampleData :product_lookup.csv
#步骤
# 1）创建lookup脚本
# transforms.conf
# [ProductIDLookup]
# external_cmd=lookup.py
# fields_list=product_id,product_type,product_name,price

import logging
import csv
import sys
#定义
logger=logging.getLogger(0)
file=logging.FileHandler("debug.log")
logger.addFilter(file)
logger.setLevel(logging.NOTSET)

DB_Path=('product_lookup.csv')
class baseProduct:
    product={}
    #__init__方法在类的一个对象被建立时，马上运行。
    #这个方法可以用来对你的对象做一些你希望的 初始化 。
    #注意，这个名称的开始和结尾都是双下划线。
    
    #1. object # public
    #2. __object__ # special, python system use, user should not define like it
    #3. __object # private (name mangling during runtime)
    #4. _object # obey python coding convention, consider it as private
    def __init__(self,DB_Path):
        #self.DB_Path=DB_Path
        f=open(DB_Path)
        db=csv.reader(f)
        
        for i in db:
            self.product[i[0]]=i
            
    def getRecord(self,keyid):
        try:
            productInfo=[]
            productInfo=self.product[keyid]
            
            return productInfo
        except:
             pass
             
DM=baseProduct(DB_Path) 

def main():
    r=csv.reader(sys.stdin)
    w=csv.writer(sys.stdout)
#     r=[['product_id', 'product_type', 'product_name', 'price'],
#        ['AV-CB-01', '', '', ''],['FI-FW-02', '', '', ''],['FI-SW-01', '', '', ''],
#        ['FL-DLH-02', '', '', ''],['FL-DSH-01', '', '', ''],['K9-BD-01', '', '', ''],
#        ['K9-CW-01', '', '', ''],['RP-LI-02', '', '', ''],['RP-SN-01', '', '', '']]
    header=[]
    first=True
    keyid=1
    for line in r:
        header=line
        print line     
        if first:
            try:
                keyid=header.index("product_id")
                print keyid
            except:
                print "product_id must exist in csv"
                sys.exit(0)
            w.writerow(header)
            first=False
            continue
        try:
            infor=DM.getRecord(line[keyid])
        except:
            continue
        line=infor
        print line
    #logger.info(line)   
        w.writerow(line)
main()        
        
            
              
        
                   
        
#调用
#logger.info('')


#CSV操作
